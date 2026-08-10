'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card } from '@/components/ui';

interface ChatMessage {
  id: string;
  sender: 'AI' | 'CUSTOMER' | 'ADMIN';
  body: string;
  createdAt: string;
}

/** Loads the customer's most recent chat thread (if any) via RLS, then sends new messages through /api/chat. */
export function ChatWidget() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: thread } = await supabase
        .from('chat_threads')
        .select('id')
        .eq('customerId', user.id)
        .order('lastMessageAt', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (thread) {
        setThreadId(thread.id);
        const { data: history } = await supabase
          .from('chat_messages')
          .select('id, sender, body, createdAt')
          .eq('threadId', thread.id)
          .order('createdAt', { ascending: true });
        setMessages((history as ChatMessage[]) ?? []);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setError(null);
    setSending(true);
    const body = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'CUSTOMER', body, createdAt: new Date().toISOString() }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: threadId ?? undefined, body }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Something went wrong' }));
        throw new Error(typeof err.error === 'string' ? err.error : 'Message failed to send');
      }
      const json = await res.json();
      if (!threadId) setThreadId(json.threadId);
      if (json.reply) {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'AI', body: json.reply, createdAt: new Date().toISOString() }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="text-sm text-medium-gray">Loading…</p>;

  return (
    <Card className="flex h-[70vh] flex-col border border-light-gray dark:border-[#2A2A2A]">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-medium-gray">
            Ask us anything about pricing, your booking, or rentals — we usually reply in under 5 minutes.
          </p>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={m.sender === 'CUSTOMER' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={`max-w-[80%] rounded-card px-3 py-2 text-sm ${
                  m.sender === 'CUSTOMER'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-off-white text-black dark:bg-dark-gray dark:text-white'
                }`}
              >
                {m.body}
              </div>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="min-h-[48px] flex-1 rounded-card border border-light-gray bg-transparent px-3 text-sm dark:border-[#2A2A2A]"
        />
        <Button type="submit" variant="primary" disabled={sending || !input.trim()} className="h-12 px-6">
          {sending ? '…' : 'Send'}
        </Button>
      </form>
    </Card>
  );
}
