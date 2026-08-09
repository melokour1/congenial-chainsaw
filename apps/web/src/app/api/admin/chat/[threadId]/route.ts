import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Admin > Live Chats — full message history for a thread. */
export async function GET(_request: Request, { params }: { params: { threadId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const admin = createAdminClient();
  const { data: messages, error } = await admin
    .from('chat_messages')
    .select('id, sender, adminId, body, createdAt, admin:profiles(fullName)')
    .eq('threadId', params.threadId)
    .order('createdAt', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages });
}
