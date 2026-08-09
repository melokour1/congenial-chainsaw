import { createAdminClient } from '@/lib/supabase/admin';
import { ChatWorkspace } from '@/components/admin/chat-workspace';

export const dynamic = 'force-dynamic';

export default async function LiveChatsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('chat_threads')
    .select('id, status, lastMessageAt, customer:profiles!chat_threads_customerId_fkey(fullName)')
    .in('status', ['HUMAN_REQUESTED', 'HUMAN_ACTIVE'])
    .order('lastMessageAt', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Live Chats</h1>
        <p className="text-sm text-medium-gray">Conversations that have been handed off from the AI to a human.</p>
      </div>
      <ChatWorkspace threads={(data ?? []) as any} />
    </div>
  );
}
