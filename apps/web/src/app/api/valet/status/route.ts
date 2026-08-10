import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type Status = 'AVAILABLE' | 'BUSY' | 'BREAK';

/** [Take Break] / [Back to available] toggle in the valet top bar. Clock in/out is handled by /api/valet/clock. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role, valetStatus').eq('id', user.id).single();
  if (!profile || profile.role !== 'VALET') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (profile.valetStatus === 'OFF' || profile.valetStatus === null) {
    return NextResponse.json({ error: 'not clocked in' }, { status: 400 });
  }

  const { status } = (await request.json()) as { status: Status };
  if (!['AVAILABLE', 'BUSY', 'BREAK'].includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin.from('profiles').update({ valetStatus: status }).eq('id', user.id);
  return NextResponse.json({ status });
}
