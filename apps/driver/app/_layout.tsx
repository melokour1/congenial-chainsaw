import React, { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Jost_700Bold } from '@expo-google-fonts/jost';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/lib/AuthProvider';
import { NetworkProvider } from '../src/lib/NetworkProvider';
import { ToastProvider } from '../src/lib/ToastProvider';
import { OfflineBanner } from '../src/components/ui/OfflineBanner';

// Kept up as soon as the module evaluates so nothing paints before fonts are ready below.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Jost_700Bold });

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
        <NetworkProvider>
          <ToastProvider>
            <AuthProvider>
              <StatusBar style="light" />
              <OfflineBanner />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }} />
            </AuthProvider>
          </ToastProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
