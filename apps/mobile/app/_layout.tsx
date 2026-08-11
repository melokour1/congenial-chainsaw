import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { ThemeProvider, useTheme } from '../src/lib/ThemeProvider';
import { AuthProvider, useAuth } from '../src/lib/AuthProvider';

// Kept up as soon as the module evaluates so nothing paints (blank frame or a
// system-font flash of the logo) before fonts are ready below.
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { theme, mode } = useTheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Root-level auth gate: signed-out users are redirected to sign-in before
  // reaching any account-scoped screen; signed-in users are bounced out of
  // the (auth) group automatically.
  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.text} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
    </>
  );
}

export default function RootLayout() {
  // Only the two weights the <Logo> wordmark actually uses — no point pulling
  // in whole family sets for two glyphs' worth of branding.
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_800ExtraBold,
    PlayfairDisplay_700Bold_Italic,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
