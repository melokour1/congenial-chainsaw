import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/lib/AuthProvider';
import { DriverProvider, useDriver } from '../../src/lib/DriverProvider';
import { JobsProvider, useJobs } from '../../src/lib/JobsProvider';
import { COLORS } from '../../src/lib/theme';
import { ClockInScreen } from '../../src/components/driver/ClockInScreen';
import { JobAlarmModal } from '../../src/components/driver/JobAlarmModal';

function Gate({ children }: { children: React.ReactNode }) {
  const { profile } = useDriver();
  const { pendingOffers, refetch } = useJobs();
  const clockedOut = !profile.clockedInAt || profile.valetStatus === 'OFF' || profile.valetStatus === null;

  // Clocked-out drivers get ZERO data access — no tabs, no jobs, nothing fetched beyond
  // the profile poll that would notice they clocked in from another device.
  if (clockedOut) return <ClockInScreen />;

  const activeOffer = pendingOffers[0] ?? null;

  return (
    <>
      {children}
      {/* Hoisted above the tab navigator so a new job offer interrupts no matter which
          tab the driver is on — same idea as an incoming ride request. */}
      {activeOffer && <JobAlarmModal key={activeOffer.id} offer={activeOffer} onResolved={refetch} />}
    </>
  );
}

export default function AppLayout() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.black }}>
        <ActivityIndicator color={COLORS.white} />
      </View>
    );
  }

  if (!session || !profile || profile.role !== 'VALET') {
    return <Redirect href="/sign-in" />;
  }

  return (
    <DriverProvider initialProfile={profile}>
      <JobsProvider>
        <Gate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.black } }} />
        </Gate>
      </JobsProvider>
    </DriverProvider>
  );
}
