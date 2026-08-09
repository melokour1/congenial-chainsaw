import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNotification } from '@/lib/notifications';

/** Admin > Live Chats reply — appears in the customer's same thread, labeled 👤 LAXValetCare Team. */
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { threadId, body } = (await request.json()) as { threadId: string; body: string };
  const admin = createAdminClient();
  await admin.from('chat_messages').insert({ id: crypto.randomUUID(), threadId, sender: 'ADMIN', adminId: user!.id, body });
  const { data: thread } = await admin.from('chat_threads').update({ status: 'HUMAN_ACTIVE', lastMessageAt: new Date().toISOString() }).eq('id', threadId).select('customerId').single();

  if (thread) {
    await sendNotification({
      profileId: thread.customerId, title: 'New reply from LAXValetCare', body, type: 'CHAT_REPLY',
    });
  }

  return NextResponse.json({ ok: true });
}
