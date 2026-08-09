import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNotification } from '@/lib/notifications';
import { returnValetToBackOfQueue } from '@/lib/queue';

/**
 * Valet action buttons (spec 4.6) — each transition writes the reservation status,
 * logs the action, and sends the exact customer notification the valet app previews
 * before confirming ("This will send: '...'").
 */
type ActionType =
  | 'HEADING_TO_TERMINAL'
  | 'AT_CURBSIDE_DEPARTURE'
  | 'VEHICLE_RECEIVED'
  | 'HEADING_WITH_VEHICLE'
  | 'AT_CURBSIDE_RETURN'
  | 'VEHICLE_DELIVERED';

const TRANSITIONS: Record<ActionType, { status: string; title: (r: any) => string; body: (r: any) => string }> = {
  HEADING_TO_TERMINAL: {
    status: 'LIVE',
    title: () => 'Your valet is on the way',
    body: () => 'Your valet is heading to your terminal now',
  },
  AT_CURBSIDE_DEPARTURE: {
    status: 'LIVE',
    title: (r) => 'Your valet has arrived',
    body: (r) => `Your valet is waiting at Terminal ${r.terminal?.code ?? ''} curbside`,
  },
  VEHICLE_RECEIVED: {
    status: 'CHECKED_IN',
    title: () => 'Your car is with us ✈️',
    body: () => 'Safe travels! Your vehicle is parked securely.',
  },
  HEADING_WITH_VEHICLE: {
    status: 'DELIVERING',
    title: () => 'Your car is on its way',
    body: () => 'Your car is on its way',
  },
  AT_CURBSIDE_RETURN: {
    status: 'DELIVERING',
    title: (r) => 'Your car is here!',
    body: (r) => `Your car is here! ${r.valetName ?? 'Your valet'} at Terminal ${r.terminal?.code ?? ''}`,
  },
  VEHICLE_DELIVERED: {
    status: 'DELIVERED_PENDING_CLOSE',
    title: () => 'Thank you for choosing LAXValetCare',
    body: () => 'Your car has been delivered — please rate your trip and leave a tip for your valet.',
  },
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'VALET' && profile.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { action } = (await request.json()) as { action: ActionType };
  const transition = TRANSITIONS[action];
  if (!transition) return NextResponse.json({ error: 'unknown action' }, { status: 400 });

  const admin = createAdminClient();
  const { data: reservation } = await admin
    .from('reservations')
    .select('*, terminal:terminals(code)')
    .eq('id', params.id)
    .single();
  if (!reservation) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await admin.from('reservations').update({ status: transition.status }).eq('id', params.id);
  await admin.from('activity_logs').insert({
    id: crypto.randomUUID(), reservationId: params.id, actorId: user.id, action, detail: null,
  });

  await sendNotification({
    profileId: reservation.customerId,
    title: transition.title(reservation),
    body: transition.body(reservation),
    type: `RESERVATION_${action}`,
    reservationId: params.id,
  });

  if (action === 'VEHICLE_DELIVERED') {
    await returnValetToBackOfQueue(admin, user.id);
  }

  return NextResponse.json({ status: transition.status, sentMessage: transition.body(reservation) });
}
