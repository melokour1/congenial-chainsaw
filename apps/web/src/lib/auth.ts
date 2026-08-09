import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

export interface Profile {
  id: string;
  role: 'CUSTOMER' | 'VALET' | 'ADMIN';
  fullName: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  valetStatus: 'AVAILABLE' | 'BUSY' | 'BREAK' | 'OFF' | null;
  queuePosition: number | null;
  clockedInAt: string | null;
}

/** Current signed-in user's profile row, or null if signed out. Respects RLS (own row only). */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return (data as Profile) ?? null;
}

/** Server Component guard — redirects if not signed in, or wrong role. */
export async function requireRole(role: Profile['role'], redirectTo = '/'): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) {
    redirect(redirectTo);
  }
  return profile;
}
