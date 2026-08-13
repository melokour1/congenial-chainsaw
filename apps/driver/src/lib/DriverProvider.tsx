import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { api, ApiError } from './api';
import { haptics } from './haptics';
import { withRetry } from './retry';
import { supabase } from './supabase';
import { useToast } from './ToastProvider';
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
const SESSION_WARNING_BEFORE_MS = 10 * 60 * 1000; // heads-up 10 minutes before the 14hr auto-expiry

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  return fallback;
}

/** Mirrors apps/web/src/components/valet/ValetContext.tsx — same endpoints, same polling cadence. */
export function DriverProvider({ initialProfile, children }: { initialProfile: ValetProfile; children: React.ReactNode }) {
  const [profile, setProfile] = useState<ValetProfile>(initialProfile);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const { showToast } = useToast();
  const pollFailingRef = useRef(false);
  const warnedExpiryRef = useRef<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await withRetry(() => api.get<ValetProfile>('/api/valet/me'));
      setProfile(data);
      if (pollFailingRef.current) {
        pollFailingRef.current = false;
        showToast('Back online', 'success');
      }
    } catch {
      // Only surface this once per outage, not every 7s poll tick — a
      // driver mid-shift doesn't need the same toast twenty times.
      if (!pollFailingRef.current) {
        pollFailingRef.current = true;
        showToast("Can't reach LAXValetCare — retrying…", 'error');
      }
    }
  }, [showToast]);

  useEffect(() => {
    const interval = setInterval(refreshProfile, POLL_MS);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  // 14hr session auto-expiry — bounce to sign-in if the clock runs out mid-shift,
  // with a heads-up toast 10 minutes out so it never comes as a surprise mid-job.
  useEffect(() => {
    if (!profile.sessionExpiresAt) return;
    const expiresAt = new Date(profile.sessionExpiresAt).getTime();
    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) {
      supabase.auth.signOut();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => { supabase.auth.signOut(); }, msLeft));

    const warnIn = msLeft - SESSION_WARNING_BEFORE_MS;
    if (warnIn > 0 && warnedExpiryRef.current !== profile.sessionExpiresAt) {
      timers.push(setTimeout(() => {
        warnedExpiryRef.current = profile.sessionExpiresAt;
        showToast('Your shift session ends in 10 minutes — clock out and back in to continue.', 'info');
      }, warnIn));
    }

    return () => timers.forEach(clearTimeout);
  }, [profile.sessionExpiresAt, showToast]);

  const setStatus = useCallback(async (status: 'AVAILABLE' | 'BUSY' | 'BREAK') => {
    const previous = profileRef.current.valetStatus;
    setProfile((p) => ({ ...p, valetStatus: status }));
    try {
      await api.post('/api/valet/status', { status });
      haptics.tap();
      await refreshProfile();
    } catch (err) {
      setProfile((p) => ({ ...p, valetStatus: previous }));
      showToast(errorMessage(err, 'Could not update your status — try again.'), 'error');
      haptics.error();
    }
  }, [refreshProfile, showToast]);

  const clockIn = useCallback(async () => {
    try {
      await api.post('/api/valet/clock', { action: 'CLOCK_IN' });
      haptics.success();
      await refreshProfile();
    } catch (err) {
      showToast(errorMessage(err, 'Could not clock in — try again.'), 'error');
      haptics.error();
      throw err;
    }
  }, [refreshProfile, showToast]);

  const clockOut = useCallback(async () => {
    try {
      await api.post('/api/valet/clock', { action: 'CLOCK_OUT' });
      haptics.success();
      await supabase.auth.signOut();
      router.replace('/sign-in');
    } catch (err) {
      showToast(errorMessage(err, 'Could not clock out — try again.'), 'error');
      haptics.error();
      throw err;
    }
  }, [showToast]);

  return (
    <DriverContext.Provider value={{ profile, refreshProfile, setStatus, clockIn, clockOut }}>
      {children}
    </DriverContext.Provider>
  );
}
