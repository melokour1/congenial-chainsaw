import { NextResponse } from 'next/server';
import { customerAtCurbSchema } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Return Day Stage 2 — customer is physically at the curb. Per spec 1.10/4.8, this alarm
 * goes ONLY to the valet already assigned from Stage 1 (no re-queue) plus admins, not the
 * whole queue. If that valet doesn't act within 3 minutes, the client UI should offer the
 * admin a [Reassign] action (calls PATCH /api/reservations/[id] with a new returnValetId).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = customerAtCurbSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminClient();
  const { data: reservation } = await admin.from('reservations').select('returnValetId').eq('id', id).single();
  if (!reservation) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await admin.from('reservations').update({
    customerAtCurbAt: new Date().toISOString(),
    curbLocationDetail: parsed.data.curbLocationDetail,
    status: 'RETURN_REQUESTED',
  }).eq('id', id);

  if (reservation.returnValetId) {
    await admin.from('notifications').insert({
      id: crypto.randomUUID(), profileId: reservation.returnValetId, title: '🔴 Customer at the curb',
      body: `At Terminal — ${parsed.data.curbLocationDetail}`, type: 'CUSTOMER_AT_CURB', reservationId: id, sentVia: ['IN_APP'],
    });
  }
  const { data: admins } = await admin.from('profiles').select('id').eq('role', 'ADMIN');
  for (const a of admins ?? []) {
    await admin.from('notifications').insert({
      id: crypto.randomUUID(), profileId: a.id, title: 'Customer at curb', body: `Reservation ${id}`,
      type: 'CUSTOMER_AT_CURB', reservationId: id, sentVia: ['IN_APP'],
    });
  }

  return NextResponse.json({ ok: true, assignedValetId: reservation.returnValetId });
}
