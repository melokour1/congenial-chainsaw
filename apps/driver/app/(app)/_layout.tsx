import React, { useRef } from 'react';
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
  // AuthProvider's `loading`/`profile` flip briefly on every background auth
  // event once signed in (a token auto-refresh, this screen's own password
  // change) — not just the initial sign-in. Gating on those every render
  // would unmount this whole subtree (Stack included) and remount it each
  // time, silently resetting navigation back to whatever the default tab is.
  // So the loading spinner and role check only ever run once, on the very
  // first pass; after that, only an actual sign-out (session going null)
  // should kick the driver back out.
  const enteredRef = useRef(false);

  if (!enteredRef.current) {
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
    enteredRef.current = true;
  }

  if (!session) {
    enteredRef.current = false;
    return <Redirect href="/sign-in" />;
  }

  if (!profile) {
    // Between sign-out clearing profile and the redirect above actually
    // navigating — a one-frame gap, not a real loading state to react to.
    return null;
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
