'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useValet } from './ValetContext';
import { ConfirmDialog } from './ConfirmDialog';

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: 'bg-green-500/15 text-green-400',
  BUSY: 'bg-gold/15 text-gold',
  BREAK: 'bg-blue-500/15 text-blue-400',
};

export function TopBar() {
  const { profile, setStatus, clockOut } = useValet();
  const [confirmClockOut, setConfirmClockOut] = useState(false);
  const [busy, setBusy] = useState(false);

  const onBreakToggle = async () => {
    setBusy(true);
    try {
      await setStatus(profile.valetStatus === 'BREAK' ? 'AVAILABLE' : 'BREAK');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-light-gray bg-black/95 px-4 py-3 backdrop-blur">
        <Link href="/valet/profile" className="flex min-w-0 items-center gap-2">
          <span className="truncate font-display text-base font-bold text-white">{profile.fullName}</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_STYLE[profile.valetStatus ?? ''] ?? 'bg-gray-500/15 text-gray-400'}`}>
            {profile.valetStatus ?? '—'}
          </span>
          {profile.queuePosition != null && (
            <span className="rounded-full border border-light-gray px-3 py-1 text-xs text-medium-gray whitespace-nowrap">
              #{profile.queuePosition} in queue
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBreakToggle}
            disabled={busy || profile.valetStatus === 'BUSY'}
            className="h-10 rounded-card border border-light-gray px-3 text-xs font-medium text-white disabled:opacity-40"
          >
            {profile.valetStatus === 'BREAK' ? 'Back to Available' : 'Take Break'}
          </button>
          <button
            onClick={() => setConfirmClockOut(true)}
            className="h-10 rounded-card bg-white px-3 text-xs font-medium text-black"
          >
            Clock Out
          </button>
        </div>
      </header>

      {confirmClockOut && (
        <ConfirmDialog
          title="Clock out?"
          message="You'll be signed out and removed from the queue. Any active jobs should be completed first."
          confirmLabel="Yes, clock out"
          onConfirm={clockOut}
          onCancel={() => setConfirmClockOut(false)}
        />
      )}
    </>
  );
}
