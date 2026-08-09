import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Admin > Settings > Terminal directory — edit closed/note flags. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const patch = await request.json();
  const admin = createAdminClient();
  const { error } = await admin.from('terminals').update(patch).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
