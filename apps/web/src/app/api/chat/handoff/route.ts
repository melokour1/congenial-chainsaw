import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** "Talk to a human" — flips the thread to HUMAN_REQUESTED; it shows up in Admin > Live Chats. */
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { threadId } = (await request.json()) as { threadId: string };
  const admin = createAdminClient();
  await admin.from('chat_threads').update({ status: 'HUMAN_REQUESTED' }).eq('id', threadId).eq('customerId', user.id);
  await admin.from('chat_messages').insert({
    id: crypto.randomUUID(), threadId, sender: 'AI',
    body: "Connecting... your history has been shared. We'll reply shortly — average response time is ~5 min.",
  });

  return NextResponse.json({ ok: true });
}
