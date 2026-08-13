import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  apiUrl?: string;
};

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? '';
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Don't throw — keep the app bootable so the rest of the UI is still
  // browsable/reviewable even if env config is missing; auth calls will fail.
  console.warn('[supabase] Missing SUPABASE_URL / SUPABASE_ANON_KEY — check apps/driver/.env');
}

// Same Supabase project + anon key as apps/web and apps/mobile (RLS applies
// identically). AsyncStorage as the session storage adapter — standard for
// Expo native apps.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
