import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNotification } from '@/lib/notifications';

const ADD_ON_LABEL: Record<string, string> = {
  HAND_WASH: 'Hand Wash',
  FULL_DETAIL: 'Full Detail',
  EV_CHARGE: 'EV Charge',
  GAS_FILL_UP: 'Gas Fill-Up',
};

/**
 * Marks a service add-on complete (spec 4.5 "Service updates" checklist). Photos are already
 * uploaded via POST /api/photos (stage: 'ADDON', reservationId) before this is called — this
 * route just flips the add-on's status and notifies the customer.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ addOnId: string }> }) {
  const { addOnId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'VALET' && profile.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: addOn } = await admin.from('reservation_add_ons').select('*').eq('id', addOnId).single();
  if (!addOn) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const completedAt = new Date().toISOString();
  await admin.from('reservation_add_ons').update({ status: 'COMPLETE', completedAt }).eq('id', addOnId);

  const { data: reservation } = await admin.from('reservations').select('id, customerId, customer:profiles!reservations_customerId_fkey(email, phone)').eq('id', addOn.reservationId).single();

  const label = ADD_ON_LABEL[addOn.type] ?? addOn.type;
  await admin.from('activity_logs').insert({
    id: crypto.randomUUID(), reservationId: addOn.reservationId, actorId: user.id,
    action: `Completed add-on: ${label}`, detail: { addOnId },
  });

  if (reservation) {
    const customer = Array.isArray(reservation.customer) ? reservation.customer[0] : reservation.customer;
    await sendNotification({
      profileId: reservation.customerId,
      title: 'Service complete',
      body: `Your ${label} is complete ✨`,
      type: 'ADDON_COMPLETE',
      reservationId: addOn.reservationId,
      email: customer?.email,
      phone: customer?.phone,
    });
  }

  return NextResponse.json({ ok: true, sentMessage: `Your ${label} is complete ✨` });
}
