import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** [CLIENT CLOSE] (spec 3.3) — only sends a review-request notification if the in-app rating was 4-5 stars. */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const admin = createAdminClient();
  const { data: reservation } = await admin.from('reservations').select('customerId, rating:ratings(stars)').eq('id', params.id).single();
  if (!reservation) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await admin.from('reservations').update({ status: 'CLOSED' }).eq('id', params.id);

  const stars = (reservation as any).rating?.stars as number | undefined;
  if (stars && stars >= 4) {
    await admin.from('notifications').insert({
      id: crypto.randomUUID(), profileId: reservation.customerId, title: 'Leave us a review?',
      body: 'Glad you had a great trip! Mind sharing it on Google or the App Store?', type: 'REVIEW_REQUEST',
      reservationId: params.id, sentVia: ['IN_APP'],
    });
  }

  return NextResponse.json({ status: 'CLOSED', reviewRequested: !!(stars && stars >= 4) });
}
