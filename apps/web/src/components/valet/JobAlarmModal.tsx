'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import type { JobOfferSummary } from './types';

const COUNTDOWN_SECONDS = 60;

const JOB_TYPE_LABEL: Record<string, string> = {
  DEPARTURE: 'Departure — car drop-off',
  RETURN_STAGE1: 'Return — get ready',
  RETURN_STAGE2: 'Return — customer at curb',
};

/** Full-screen 60s accept/decline alarm for a new job offer (spec 4.3/5). Auto-expires if untouched. */
export function JobAlarmModal({ offer, onResolved }: { offer: JobOfferSummary; onResolved: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [responding, setResponding] = useState(false);
  const resolvedRef = useRef(false);

  const respond = async (response: 'ACCEPTED' | 'DECLINED' | 'EXPIRED') => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setResponding(true);
    try {
      await fetch(`/api/queue/offers/${offer.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
    } finally {
      onResolved();
    }
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      respond('EXPIRED');
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const r = offer.reservation;
  const isManual = r?.transmission === 'MANUAL';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black px-6 py-8 text-white" role="alertdialog" aria-modal="true">
      <div className="w-full text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">New Job</p>
        <p className="mt-1 font-display text-xl font-bold">{JOB_TYPE_LABEL[offer.jobType] ?? offer.jobType}</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold text-5xl font-display font-extrabold">
          {secondsLeft}
        </div>
        <p className="text-sm text-medium-gray">seconds to respond</p>
      </div>

      <div className="w-full max-w-sm space-y-3 rounded-card border border-light-gray bg-dark-gray p-4">
        {isManual && (
          <div className="rounded-card bg-red-500/15 px-3 py-2 text-center text-sm font-bold text-red-400">
            ⚠️ MANUAL TRANSMISSION
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-medium-gray">Customer</span>
          <span className="font-medium">{r?.customer?.fullName ?? '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-medium-gray">Vehicle</span>
          <span className="font-medium">{r ? `${r.vehicleColor} ${r.vehicleMake} ${r.vehicleModel}` : '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-medium-gray">Terminal</span>
          <span className="font-medium">{r?.terminal?.code ?? '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-medium-gray">Booking</span>
          <span className="font-medium">{r?.bookingCode ?? '—'}</span>
        </div>
      </div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        <Button
          variant="secondary"
          className="h-16 border-red-500 text-lg font-display font-bold text-red-400"
          disabled={responding}
          onClick={() => respond('DECLINED')}
        >
          Decline
        </Button>
        <Button
          variant="primary"
          className="h-16 text-lg font-display font-bold"
          disabled={responding}
          onClick={() => respond('ACCEPTED')}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
