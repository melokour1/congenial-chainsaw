import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { uploadDataUrl } from '@/lib/storage';

/** Valet profile photo upload (spec 4.9 — required, flagged if missing). */
export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'VALET' && profile.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { dataUrl } = (await request.json()) as { dataUrl: string };
  if (!dataUrl) return NextResponse.json({ error: 'dataUrl is required' }, { status: 400 });

  const url = await uploadDataUrl('photos', `profiles/${user.id}/${crypto.randomUUID()}.jpg`, dataUrl);

  const admin = createAdminClient();
  await admin.from('profiles').update({ photoUrl: url }).eq('id', user.id);

  return NextResponse.json({ url });
}
