import React from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer, StepHeader, EmptyState } from '../../../src/components/ui';

export default function SavedVehiclesScreen() {
  const router = useRouter();
  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <StepHeader title="Saved vehicles" onBack={() => router.back()} />
      <EmptyState
        icon="car-outline"
        title="Coming soon"
        body="Saving your vehicle details for faster valet bookings isn't available yet — for now, enter your car's info each time you book."
      />
    </ScreenContainer>
  );
}
