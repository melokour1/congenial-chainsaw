'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card } from '@/components/ui';

/**
 * Standalone sign-in / create-account form for the /login and /register pages.
 * Mirrors InlineAuthGate's logic (used mid-booking-wizard) but redirects via
 * the router instead of an onSignedIn callback. Honors ?next= so links into
 * a gated page (e.g. /admin) can send the user back after signing in.
 */
export function AuthForm({ initialMode }: { initialMode: 'signin' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push(next);
        router.refresh();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'CUSTOMER', fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (signUpError) throw signUpError;
        // If email confirmations are off, the session is active immediately.
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          router.push(next);
          router.refresh();
        } else {
          setCheckEmail(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <Card className="border border-light-gray dark:border-[#2A2A2A]">
        <h3 className="font-display text-lg font-bold">Check your inbox</h3>
        <p className="mt-2 text-sm text-medium-gray">
          We sent a confirmation link to {email}. Confirm your email, then sign in.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-light-gray dark:border-[#2A2A2A]">
      <h3 className="font-display text-lg font-bold">{mode === 'signin' ? 'Sign in' : 'Create your account'}</h3>

      <div className="mt-4 flex gap-2 rounded-card border border-light-gray p-1 dark:border-[#2A2A2A]">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`min-h-[40px] flex-1 rounded-card text-sm font-medium ${mode === 'signin' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-medium-gray'}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`min-h-[40px] flex-1 rounded-card text-sm font-medium ${mode === 'signup' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-medium-gray'}`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm dark:border-[#2A2A2A]"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm dark:border-[#2A2A2A]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm dark:border-[#2A2A2A]"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" variant="primary" disabled={loading} className="h-12">
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>
    </Card>
  );
}
