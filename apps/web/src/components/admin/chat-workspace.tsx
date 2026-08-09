'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ChatThreadRow {
  id: string;
  status: string;
  lastMessageAt: string;
  customer: { fullName: string } | null;
}

interface Message {
  id: string;
  sender: 'AI' | 'CUSTOMER' | 'ADMIN';
  body: string;
  createdAt: string;
  admin: { fullName: string } | null;
}

function senderLabel(m: Message) {
  if (m.sender === 'AI') return '✨ AI';
  if (m.sender === 'ADMIN') return '👤 LAXValetCare Team';
  return 'Customer';
}

export function ChatWorkspace({ threads }: { threads: ChatThreadRow[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(threads[0]?.id ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    fetch(`/api/admin/chat/${selectedId}`)
      .then((r) => r.json())
      .then((json) => setMessages(json.messages ?? []))
      .finally(() => setLoading(false));
  }, [selectedId]);

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    const res = await fetch('/api/chat/admin-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: selectedId, body: reply }),
    });
    setSending(false);
    if (res.ok) {
      setReply('');
      const json = await fetch(`/api/admin/chat/${selectedId}`).then((r) => r.json());
      setMessages(json.messages ?? []);
      router.refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="flex flex-col gap-1 lg:col-span-1">
        {threads.length === 0 && <p className="text-sm text-medium-gray">No active chats need a human right now.</p>}
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={cn('flex flex-col rounded-card px-3 py-2.5 text-left transition-colors', selectedId === t.id ? 'bg-white text-black' : 'hover:bg-white/5')}
          >
            <span className="text-sm font-medium">{t.customer?.fullName ?? 'Unknown customer'}</span>
            <span className={cn('text-xs', selectedId === t.id ? 'text-black/60' : 'text-medium-gray')}>{t.status.replaceAll('_', ' ')} · {new Date(t.lastMessageAt).toLocaleTimeString()}</span>
          </button>
        ))}
      </Card>

      <Card className="flex flex-col gap-3 lg:col-span-2">
        {!selectedId ? (
          <p className="text-sm text-medium-gray">Select a conversation.</p>
        ) : (
          <>
            <div className="flex max-h-[480px] flex-col gap-3 overflow-y-auto">
              {loading && <p className="text-sm text-medium-gray">Loading…</p>}
              {!loading && messages.length === 0 && <p className="text-sm text-medium-gray">No messages yet.</p>}
              {messages.map((m) => (
                <div key={m.id} className={cn('max-w-[80%] rounded-card px-3 py-2', m.sender === 'CUSTOMER' ? 'self-start bg-white/10' : 'self-end bg-gold/15')}>
                  <div className="text-xs font-medium text-medium-gray">{senderLabel(m)}</div>
                  <div className="text-sm text-white">{m.body}</div>
                  <div className="text-xs text-medium-gray">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-light-gray/10 pt-3">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }}
                placeholder="Reply as LAXValetCare Team…"
                className="h-11 flex-1 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white placeholder:text-medium-gray focus:outline-none"
              />
              <Button variant="primary" className="h-11 px-4 text-sm" onClick={sendReply} disabled={sending || !reply.trim()}>Send</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
