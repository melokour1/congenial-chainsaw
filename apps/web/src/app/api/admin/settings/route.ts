import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Admin > Settings — upserts any app_settings row (key='pricing' | 'business' | 'chat' | 'overdue_escalation' | ...). */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { key, value } = (await request.json()) as { key: string; value: unknown };
  if (!key || value === undefined) return NextResponse.json({ error: 'key and value required' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from('app_settings').upsert({ key, value, updatedAt: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from('activity_logs').insert({ id: crypto.randomUUID(), actorId: user!.id, action: `Updated settings: ${key}`, detail: value as any });

  return NextResponse.json({ ok: true });
}
