import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Clock in/out (spec 4.1) — clocked out = zero data access; a 14hr session auto-expires client-side via sessionExpiresAt. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'VALET') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { action } = (await request.json()) as { action: 'CLOCK_IN' | 'CLOCK_OUT' };
  const admin = createAdminClient();

  if (action === 'CLOCK_IN') {
    const { data: max } = await admin.from('profiles').select('queuePosition').eq('role', 'VALET').order('queuePosition', { ascending: false, nullsFirst: false }).limit(1).single();
    const sessionExpiresAt = new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString();
    await admin.from('profiles').update({
      valetStatus: 'AVAILABLE', clockedInAt: new Date().toISOString(), sessionExpiresAt,
      queuePosition: (max?.queuePosition ?? 0) + 1,
    }).eq('id', user!.id);
    return NextResponse.json({ status: 'AVAILABLE', sessionExpiresAt });
  }

  await admin.from('profiles').update({ valetStatus: 'OFF', clockedInAt: null, sessionExpiresAt: null, queuePosition: null }).eq('id', user!.id);
  await supabase.auth.signOut();
  return NextResponse.json({ status: 'OFF' });
}
