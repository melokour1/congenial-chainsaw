import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { respondToOffer } from '@/lib/queue';

/** Valet taps Accept/Decline on the 60s job alarm, or the app auto-calls EXPIRED when the countdown hits zero. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { response } = (await request.json()) as { response: 'ACCEPTED' | 'DECLINED' | 'EXPIRED' };
  const admin = createAdminClient();
  const result = await respondToOffer(admin, id, response);
  return NextResponse.json(result);
}
