import React from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer, StepHeader, EmptyState } from '../../../src/components/ui';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <StepHeader title="Notification settings" onBack={() => router.back()} />
      <EmptyState
        icon="notifications-outline"
        title="Coming soon"
        body="Per-notification controls (booking updates, promos, etc.) aren't available yet — we'll still notify you about your bookings in the meantime."
      />
    </ScreenContainer>
  );
}
