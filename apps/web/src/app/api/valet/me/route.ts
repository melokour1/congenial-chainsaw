import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Caller's own profile row — polled client-side every few seconds to keep queue position / status / session expiry fresh. */
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile, error } = await admin.from('profiles').select('*').eq('id', user.id).single();
  if (error || !profile) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (profile.role !== 'VALET' && profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  return NextResponse.json(profile);
}
