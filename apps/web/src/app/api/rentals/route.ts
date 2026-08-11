import { NextResponse } from 'next/server';
import { calcRentalPrice, rentalBookingStepSchema } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPricingConfig } from '@/lib/pricing-config';
import { generateBookingCode } from '@/lib/booking-code';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('rental_bookings')
    .select('*, fleetVehicle:fleet_vehicles(*)')
    .eq('customerId', user.id)
    .order('createdAt', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = rentalBookingStepSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  const admin = createAdminClient();
  const { data: vehicle } = await admin.from('fleet_vehicles').select('*').eq('id', input.fleetVehicleId).single();
  if (!vehicle || vehicle.status !== 'AVAILABLE') {
    return NextResponse.json({ error: 'vehicle not available' }, { status: 409 });
  }

  const pricing = await getPricingConfig();
  const breakdown = calcRentalPrice(
    {
      pickupDate: new Date(input.pickupDate),
      returnDate: new Date(input.returnDate),
      rentalClass: vehicle.class,
      deliveryMethod: input.deliveryMethod,
      insurance: { option: 'OWN' }, // finalized in the insurance step; recalculated then
    },
    pricing,
  );

  // Returning customers with a verification already on file skip re-verification (spec 1.6,
  // Step 3) — this is keyed on the row existing at all, not on faceMatchStatus === 'MATCHED',
  // since without a real ID-verification provider configured (see the MANUAL_REVIEW fallback
  // in the verification route) faceMatchStatus effectively never reaches MATCHED in this
  // environment. `needsVerification` below drives whether the client shows the identity
  // form; `status` must use the exact same condition, or a returning customer gets skipped
  // past that form while their booking is still created as PENDING_VERIFICATION — stuck
  // showing "Verification needed" even after they go on to submit insurance.
  const { data: existingVerification } = await admin
    .from('rental_verifications')
    .select('faceMatchStatus')
    .eq('customerId', user.id)
    .maybeSingle();

  const id = crypto.randomUUID();
  const bookingCode = generateBookingCode();
  const { error } = await admin.from('rental_bookings').insert({
    id,
    bookingCode,
    customerId: user.id,
    fleetVehicleId: input.fleetVehicleId,
    pickupDate: input.pickupDate,
    returnDate: input.returnDate,
    deliveryMethod: input.deliveryMethod,
    deliveryAddress: input.deliveryAddress ?? null,
    status: existingVerification ? 'PENDING_INSURANCE' : 'PENDING_VERIFICATION',
    insuranceOption: 'OWN',
    priceBreakdown: breakdown,
    totalCents: breakdown.totalCents,
    depositHoldCents: pricing.securityDepositCents.min,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sendNotification({
    profileId: user.id,
    title: 'Rental request received',
    body: `${vehicle.make} ${vehicle.model} — ${existingVerification ? 'awaiting insurance' : 'awaiting verification'}`,
    type: 'RENTAL_CREATED', rentalBookingId: id, email: user.email ?? undefined,
  });

  return NextResponse.json({ id, bookingCode, priceBreakdown: breakdown, needsVerification: !existingVerification }, { status: 201 });
}
