import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { api } from './api';
import { supabase } from './supabase';
import type { ValetProfile } from './types';

interface DriverContextValue {
  profile: ValetProfile;
  refreshProfile: () => Promise<void>;
  setStatus: (status: 'AVAILABLE' | 'BUSY' | 'BREAK') => Promise<void>;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
}

const DriverContext = createContext<DriverContextValue | null>(null);

export function useDriver(): DriverContextValue {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error('useDriver must be used within DriverProvider');
  return ctx;
}

const POLL_MS = 7000; // matches apps/web's ValetContext poll interval

/** Mirrors apps/web/src/components/valet/ValetContext.tsx — same endpoints, same polling cadence. */
export function DriverProvider({ initialProfile, children }: { initialProfile: ValetProfile; children: React.ReactNode }) {
  const [profile, setProfile] = useState<ValetProfile>(initialProfile);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.get<ValetProfile>('/api/valet/me');
      setProfile(data);
    } catch {
      // transient network hiccup — next poll will retry
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshProfile, POLL_MS);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  // 14hr session auto-expiry — bounce to sign-in if the clock runs out mid-shift.
  useEffect(() => {
    if (!profile.sessionExpiresAt) return;
    const expiresAt = new Date(profile.sessionExpiresAt).getTime();
    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) {
      supabase.auth.signOut();
      return;
    }
    const timeout = setTimeout(() => { supabase.auth.signOut(); }, msLeft);
    return () => clearTimeout(timeout);
  }, [profile.sessionExpiresAt]);

  const setStatus = useCallback(async (status: 'AVAILABLE' | 'BUSY' | 'BREAK') => {
    setProfile((p) => ({ ...p, valetStatus: status }));
    try {
      await api.post('/api/valet/status', { status });
      await refreshProfile();
    } catch {
      await refreshProfile();
    }
  }, [refreshProfile]);

  const clockIn = useCallback(async () => {
    await api.post('/api/valet/clock', { action: 'CLOCK_IN' });
    await refreshProfile();
  }, [refreshProfile]);

  const clockOut = useCallback(async () => {
    await api.post('/api/valet/clock', { action: 'CLOCK_OUT' });
    await supabase.auth.signOut();
    router.replace('/sign-in');
  }, []);

  return (
    <DriverContext.Provider value={{ profile, refreshProfile, setStatus, clockIn, clockOut }}>
      {children}
    </DriverContext.Provider>
  );
}
