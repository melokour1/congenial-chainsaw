import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDriver } from '../../lib/DriverProvider';
import { COLORS } from '../../lib/theme';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

/**
 * Clocked-out drivers get ZERO data access — this is the ONLY thing rendered
 * inside the app shell when valetStatus is OFF / clockedInAt is null. No
 * tabs, no jobs, nothing fetched. Mirrors apps/web's ClockInScreen exactly.
 */
export function ClockInScreen() {
  const { profile, clockIn } = useDriver();
  const [loading, setLoading] = useState(false);

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await clockIn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Logo size="lg" style={{ marginBottom: 8 }} />
        <Text style={styles.title}>Welcome back, {profile.fullName.split(' ')[0]}</Text>
        <Text style={styles.subtitle}>You&rsquo;re clocked out. Clock in to see today&rsquo;s jobs and join the queue.</Text>
        <View style={{ marginTop: 32, width: '100%', maxWidth: 320 }}>
          <Button label={loading ? 'Clocking in…' : 'CLOCK IN'} size="large" onPress={handleClockIn} loading={loading} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 24,
    fontFamily: 'Jost_700Bold',
    fontSize: 24,
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
