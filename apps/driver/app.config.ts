import type { ExpoConfig, ConfigContext } from 'expo/config';

// EXPO_PUBLIC_* vars are inlined by Metro automatically from apps/driver/.env
// (see .env.example). The literal fallbacks below match apps/web's and
// apps/mobile's .env.example — same Supabase project, same RLS-scoped public
// anon key — so the app runs out of the box in local dev without a .env file.
const FALLBACK_SUPABASE_URL = 'https://modkhbmopyraankxtcfk.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZGtoYm1vcHlyYWFua3h0Y2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxODEzMzQsImV4cCI6MjEwMTc1NzMzNH0.6w_5ZmhBgmUQIKr7Q7_vBZ2M7pmFUmA0DcSADTGj2-8';
const FALLBACK_API_URL = 'http://localhost:3000';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'LAXValetCare Driver',
  slug: 'laxvaletcare-driver',
  scheme: 'laxvaletcaredriver',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  backgroundColor: '#000000',
  primaryColor: '#000000',
  newArchEnabled: true,
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.laxvaletcare.driver',
    infoPlist: {
      NSCameraUsageDescription: 'LAXValetCare Driver needs camera access to document vehicle condition at pickup and return.',
    },
  },
  android: {
    package: 'com.laxvaletcare.driver',
    adaptiveIcon: { backgroundColor: '#000000' },
    permissions: ['CAMERA'],
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#000000',
        resizeMode: 'contain',
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission: 'LAXValetCare Driver needs camera access to document vehicle condition at pickup and return.',
      },
    ],
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_SUPABASE_ANON_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL,
  },
});
