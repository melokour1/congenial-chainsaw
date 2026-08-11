import { NextResponse } from 'next/server';
import { calcRentalPrice, EXTRA_DRIVER_CENTS_PER_DAY, CHILD_SEAT_CENTS_PER_DAY } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPricingConfig } from '@/lib/pricing-config';

// Note: rental_verifications is keyed by customerId, not rentalBookingId (identity
// verification is a one-time customer fact, not per-rental) — so it isn't embeddable here.
const FULL_SELECT = '*, fleetVehicle:fleet_vehicles(*), photos(*)';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const admin = createAdminClient();
  const client = profile?.role === 'ADMIN' || profile?.role === 'VALET' ? admin : supabase;

  const { data, error } = await client.from('rental_bookings').select(FULL_SELECT).eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Customer-facing finalize step (rental wizard's Agreement + Add-ons steps).
 * Persists the signed agreement and/or add-on selections, then recalculates
 * totalCents/priceBreakdown to reflect whatever insurance option was actually
 * chosen — POST /api/rentals only ever creates the booking with a placeholder
 * OWN-insurance, zero-add-on total (see that route's comment: "recalculated then").
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as {
    agreementSignatureUrl?: string;
    extraDriver?: boolean;
    childSeat?: boolean;
  };

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from('rental_bookings')
    .select('*, fleetVehicle:fleet_vehicles(*)')
    .eq('id', id)
    .eq('customerId', user.id)
    .single();
  if (!booking) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  if (body.agreementSignatureUrl) {
    update.agreementSignatureUrl = body.agreementSignatureUrl;
    update.agreementSignedAt = new Date().toISOString();
  }

  if (body.extraDriver !== undefined || body.childSeat !== undefined) {
    const existingAddOns = (booking.addOns ?? {}) as { extraDriver?: boolean; childSeat?: boolean };
    const extraDriver = body.extraDriver ?? existingAddOns.extraDriver ?? false;
    const childSeat = body.childSeat ?? existingAddOns.childSeat ?? false;

    const pricing = await getPricingConfig();
    const days = Math.max(
      1,
      Math.ceil((new Date(booking.returnDate).getTime() - new Date(booking.pickupDate).getTime()) / 86400000),
    );

    const breakdown = calcRentalPrice(
      {
        pickupDate: new Date(booking.pickupDate),
        returnDate: new Date(booking.returnDate),
        rentalClass: booking.fleetVehicle.class,
        deliveryMethod: booking.deliveryMethod,
        insurance:
          booking.insuranceOption === 'LAXVALETCARE_PLAN'
            ? { option: 'LAXVALETCARE_PLAN', plan: booking.insurancePlan }
            : { option: 'OWN' },
        extraDriverCents: extraDriver ? EXTRA_DRIVER_CENTS_PER_DAY * days : undefined,
        childSeatCents: childSeat ? CHILD_SEAT_CENTS_PER_DAY * days : undefined,
      },
      pricing,
    );

    update.addOns = { extraDriver, childSeat };
    update.priceBreakdown = breakdown;
    update.totalCents = breakdown.totalCents;
  }

  const { data: updated, error } = await admin
    .from('rental_bookings')
    .update(update)
    .eq('id', id)
    .eq('customerId', user.id)
    .select('priceBreakdown, totalCents')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, priceBreakdown: updated.priceBreakdown, totalCents: updated.totalCents });
}
