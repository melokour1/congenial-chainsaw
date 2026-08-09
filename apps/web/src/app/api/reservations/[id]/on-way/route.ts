import { NextResponse } from 'next/server';
import { customerOnWaySchema } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { dispatchNextInQueue } from '@/lib/queue';

/** Customer taps "I'm on my way" — dispatches a DEPARTURE job offer to the next available valet in the fair queue. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = customerOnWaySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminClient();
  await admin.from('reservations').update({
    customerEtaBand: parsed.data.etaBand,
    customerEtaMinutes: parsed.data.etaMinutes ?? null,
    customerOnWayAt: new Date().toISOString(),
  }).eq('id', params.id);

  const offer = await dispatchNextInQueue(admin, { reservationId: params.id, jobType: 'DEPARTURE' });
  return NextResponse.json({ dispatched: !!offer, valetId: offer?.valetId ?? null });
}
