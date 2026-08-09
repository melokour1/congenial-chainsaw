'use client';

import { ValetProvider, useValet } from './ValetContext';
import { ClockInScreen } from './ClockInScreen';
import { TopBar } from './TopBar';
import type { ValetProfile } from './types';

function Gate({ children }: { children: React.ReactNode }) {
  const { profile } = useValet();
  const clockedOut = !profile.clockedInAt || profile.valetStatus === 'OFF' || profile.valetStatus === null;

  // Clocked-out valets get ZERO data access — no top bar, no children mounted, nothing fetched.
  if (clockedOut) return <ClockInScreen />;

  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar />
      <main className="mx-auto max-w-content px-4 pb-24 pt-4">{children}</main>
    </div>
  );
}

export function ValetShell({ initialProfile, children }: { initialProfile: ValetProfile; children: React.ReactNode }) {
  return (
    <ValetProvider initialProfile={initialProfile}>
      <Gate>{children}</Gate>
    </ValetProvider>
  );
}
