import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Exchanges the code from a Supabase email-confirmation / magic-link redirect for a session. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
