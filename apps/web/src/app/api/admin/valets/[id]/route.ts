import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  return profile?.role === 'ADMIN' ? user : null;
}

/** Admin > Valets — edit profile fields, or [Deactivate] (valetStatus = 'OFF'). */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const patch = await request.json();
  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ ...patch, updatedAt: new Date().toISOString() }).eq('id', params.id).eq('role', 'VALET');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Admin > Valets — [Delete] (guarded, secondary action; deactivate is the safer default). Removes profile + auth user. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const admin = createAdminClient();
  await admin.from('profiles').delete().eq('id', params.id).eq('role', 'VALET');
  const { error } = await admin.auth.admin.deleteUser(params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
