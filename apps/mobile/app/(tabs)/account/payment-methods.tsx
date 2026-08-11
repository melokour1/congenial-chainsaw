import React from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer, StepHeader, EmptyState } from '../../../src/components/ui';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <StepHeader title="Payment methods" onBack={() => router.back()} />
      <EmptyState
        icon="card-outline"
        title="Coming soon"
        body="Card payments aren't set up yet — bookings are created without payment for now, and we'll email you a payment link once this is live."
      />
    </ScreenContainer>
  );
}
