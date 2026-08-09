import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/lib/ThemeProvider';

export default function AccountLayout() {
  const { theme } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />;
}
