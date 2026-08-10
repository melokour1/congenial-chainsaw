import { NextResponse } from 'next/server';
import { calcValetPrice, createValetReservationSchema } from '@laxvaletcare/shared';
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
    .from('reservations')
    .select('*, addOns:reservation_add_ons(*), terminal:terminals(*)')
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
  const parsed = createValetReservationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  const pricing = await getPricingConfig();
  const breakdown = calcValetPrice(
    {
      departureDate: new Date(input.departureDate ?? Date.now()),
      returnDateEstimate: new Date(input.returnDateEstimate ?? Date.now()),
      serviceTier: input.serviceTier,
      vipPersonCount: input.vipPersonCount,
      addOns: input.addOns,
      gratuityCents: input.gratuityCents,
    },
    pricing,
  );

  const admin = createAdminClient();
  const id = crypto.randomUUID();
  const bookingCode = generateBookingCode();

  const { data: terminal } = input.terminalCode
    ? await admin.from('terminals').select('id').eq('code', input.terminalCode).single()
    : { data: null };

  const { error } = await admin.from('reservations').insert({
    id,
    bookingCode,
    customerId: user.id,
    originType: input.originType,
    terminalId: terminal?.id ?? null,
    departingAirline: input.departingAirline ?? null,
    departingFlightNumber: input.departingFlightNumber ?? null,
    returningAirline: input.returningAirline ?? null,
    returningFlightNumber: input.returningFlightNumber ?? null,
    bagsInfo: input.bagsInfo ?? null,
    departureDate: input.departureDate,
    returnDateEstimate: input.returnDateEstimate,
    vehicleColor: input.color,
    vehicleMake: input.make,
    vehicleModel: input.model,
    transmission: input.transmission,
    plate: input.plate ?? null,
    serviceTier: input.serviceTier,
    gratuityCents: input.gratuityCents ?? 0,
    priceBreakdown: breakdown,
    totalCents: breakdown.totalCents,
    status: 'CONFIRMED',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (input.addOns?.length) {
    const priceByType: Record<string, number> = {
      HAND_WASH: pricing.carCare.handWashCents,
      FULL_DETAIL: pricing.carCare.fullDetailCents,
      EV_CHARGE: pricing.carCare.evChargeCents,
      GAS_FILL_UP: pricing.carCare.gasFillUpCents ?? 0,
    };
    await admin.from('reservation_add_ons').insert(
      input.addOns.map((type) => ({ id: crypto.randomUUID(), reservationId: id, type, priceCents: priceByType[type] })),
    );
  }

  await sendNotification({
    profileId: user.id,
    title: 'Confirmed!',
    body: `Valet booked for ${new Date(input.departureDate ?? Date.now()).toLocaleDateString()}${input.terminalCode ? `, Terminal ${input.terminalCode}` : ''}`,
    type: 'BOOKING_CONFIRMED',
    reservationId: id,
    email: user.email ?? undefined,
  });

  return NextResponse.json({ id, bookingCode, priceBreakdown: breakdown }, { status: 201 });
}
