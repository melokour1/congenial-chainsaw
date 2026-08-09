import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

function randomPassword() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

/** Admin > Valets — add a new valet. No public valet signup exists, so admins provision accounts here. */
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { fullName, email, phone } = (await request.json()) as { fullName: string; email: string; phone?: string };
  if (!fullName || !email) return NextResponse.json({ error: 'fullName and email required' }, { status: 400 });

  const admin = createAdminClient();
  const tempPassword = randomPassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { role: 'VALET', fullName, phone: phone ?? null },
  });
  if (createError || !created.user) return NextResponse.json({ error: createError?.message ?? 'failed to create user' }, { status: 500 });

  // Ensure the profiles row exists regardless of whether a DB trigger also creates it.
  const { error: upsertError } = await admin.from('profiles').upsert({
    id: created.user.id,
    role: 'VALET',
    fullName,
    email,
    phone: phone ?? null,
    valetStatus: 'OFF',
    queuePosition: null,
  });
  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });

  return NextResponse.json({ id: created.user.id, tempPassword }, { status: 201 });
}
