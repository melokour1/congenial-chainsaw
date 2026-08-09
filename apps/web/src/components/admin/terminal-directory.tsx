'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';

interface Terminal {
  id: string;
  code: string;
  name: string;
  isClosed: boolean;
  closedNote: string | null;
  note: string | null;
}

export function TerminalDirectory({ terminals }: { terminals: Terminal[] }) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);

  async function toggleClosed(t: Terminal) {
    setSavingId(t.id);
    await fetch(`/api/admin/terminals/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isClosed: !t.isClosed }),
    });
    setSavingId(null);
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-2">
      <h2 className="font-display text-lg font-bold text-white">Terminal directory</h2>
      <div className="flex flex-col divide-y divide-light-gray/10 text-sm">
        {terminals.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-2">
            <div>
              <span className="font-medium text-white">{t.name}</span>
              {t.note && <span className="ml-2 text-xs text-medium-gray">{t.note}</span>}
              {t.isClosed && <span className="ml-2 text-xs text-gold">{t.closedNote ?? 'Closed'}</span>}
            </div>
            <button
              onClick={() => toggleClosed(t)}
              disabled={savingId === t.id}
              className="rounded-card border border-light-gray/30 px-3 py-1.5 text-xs text-white hover:bg-white/5"
            >
              {t.isClosed ? 'Mark open' : 'Mark closed'}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
