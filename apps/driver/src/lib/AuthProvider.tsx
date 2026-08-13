import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { ValetProfile } from './types';

interface AuthContextValue {
  session: Session | null;
  profile: ValetProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Driver-only auth. Unlike apps/mobile's customer AuthProvider, there is no
 * sign-up flow here — valets are provisioned by an admin (apps/web's
 * Admin > Valets), not self-registered. Signing in with a non-VALET account
 * (a customer's, say) is rejected and immediately signed back out — this app
 * has nothing for anyone else.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ValetProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile((data as ValetProfile) ?? null);
    return (data as ValetProfile) ?? null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user.id) {
        const p = await loadProfile(data.session.user.id);
        // A previously-persisted session for a non-VALET account (or one
        // whose role changed) shouldn't silently sit signed in here.
        if (p && p.role !== 'VALET') {
          await supabase.auth.signOut();
          setSession(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user.id) {
        // Without this, `loading` stays false (set once at initial boot) while
        // `profile` briefly lags a render behind the new `session` — long enough
        // for (app)/_layout's `!profile` guard to catch it mid-fetch and bounce
        // straight back to /sign-in before the profile ever arrives. Re-arming
        // `loading` here closes that gap: the layout shows its spinner instead.
        setLoading(true);
        loadProfile(newSession.user.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      refreshProfile: async () => {
        if (session?.user.id) await loadProfile(session.user.id);
      },
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };

        const p = await loadProfile(data.user.id);
        if (!p || p.role !== 'VALET') {
          await supabase.auth.signOut();
          return { error: 'This app is for LAXValetCare drivers only.' };
        }
        return { error: null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
