import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { ChatWidget } from '@/components/site/chat-widget';

export default async function ChatPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?next=/account/chat');

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Ask LAXValetCare</h1>
      <p className="mt-2 text-medium-gray">Chat with our assistant, or ask to talk to a human.</p>
      <div className="mt-8">
        <ChatWidget />
      </div>
    </div>
  );
}
