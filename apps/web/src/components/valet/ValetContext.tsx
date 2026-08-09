'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ValetProfile } from './types';

interface ValetContextValue {
  profile: ValetProfile;
  refreshProfile: () => Promise<void>;
  setStatus: (status: 'AVAILABLE' | 'BUSY' | 'BREAK') => Promise<void>;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
}

const ValetContext = createContext<ValetContextValue | null>(null);

export function useValet(): ValetContextValue {
  const ctx = useContext(ValetContext);
  if (!ctx) throw new Error('useValet must be used within ValetProvider');
  return ctx;
}

const POLL_MS = 7000;

export function ValetProvider({ initialProfile, children }: { initialProfile: ValetProfile; children: React.ReactNode }) {
  const [profile, setProfile] = useState<ValetProfile>(initialProfile);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/valet/me');
      if (!res.ok) return;
      const data = (await res.json()) as ValetProfile;
      setProfile(data);
    } catch {
      // transient network hiccup — next poll will retry
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshProfile, POLL_MS);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  // 14hr session auto-expiry — bounce to login if the clock runs out mid-shift.
  useEffect(() => {
    if (!profile.sessionExpiresAt) return;
    const expiresAt = new Date(profile.sessionExpiresAt).getTime();
    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) {
      window.location.href = '/login';
      return;
    }
    const timeout = setTimeout(() => { window.location.href = '/login'; }, msLeft);
    return () => clearTimeout(timeout);
  }, [profile.sessionExpiresAt]);

  const setStatus = useCallback(async (status: 'AVAILABLE' | 'BUSY' | 'BREAK') => {
    setProfile((p) => ({ ...p, valetStatus: status }));
    const res = await fetch('/api/valet/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await refreshProfile();
  }, [refreshProfile]);

  const clockIn = useCallback(async () => {
    const res = await fetch('/api/valet/clock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CLOCK_IN' }),
    });
    if (res.ok) await refreshProfile();
  }, [refreshProfile]);

  const clockOut = useCallback(async () => {
    await fetch('/api/valet/clock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CLOCK_OUT' }),
    });
    window.location.href = '/login';
  }, []);

  return (
    <ValetContext.Provider value={{ profile, refreshProfile, setStatus, clockIn, clockOut }}>
      {children}
    </ValetContext.Provider>
  );
}
