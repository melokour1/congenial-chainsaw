'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useValet } from './ValetContext';

/**
 * Clocked-out valets get ZERO data access (spec 4.1) — this is the ONLY thing rendered
 * inside app/valet/** when valetStatus is OFF / clockedInAt is null. No top bar, no jobs.
 */
export function ClockInScreen() {
  const { profile, clockIn } = useValet();
  const [loading, setLoading] = useState(false);

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await clockIn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center text-white">
      <div className="space-y-2">
        <p className="font-display text-2xl font-bold">Welcome back, {profile.fullName.split(' ')[0]}</p>
        <p className="text-medium-gray">You're clocked out. Clock in to see today's jobs and join the queue.</p>
      </div>
      <Button
        variant="primary"
        className="h-16 w-full max-w-xs text-lg font-display font-bold"
        onClick={handleClockIn}
        disabled={loading}
      >
        {loading ? 'Clocking in…' : 'CLOCK IN'}
      </Button>
    </div>
  );
}
