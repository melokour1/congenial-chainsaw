import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/ThemeProvider';
import { useAuth } from '../../lib/AuthProvider';
import { useReservations } from '../../hooks/useReservations';
import { useRentals } from '../../hooks/useRentals';
import { formatCents, formatDate } from '../../lib/format';
import { Card, Badge, Button } from '../ui';

export function ForYouHomeTab() {
  const { theme } = useTheme();
  const router = useRouter();
  const { profile } = useAuth();
  const { reservations } = useReservations();
  const { rentals } = useRentals();

  const completedTrips = reservations.filter((r) => r.status === 'CLOSED');
  const totalSpentCents = completedTrips.reduce((sum, r) => sum + r.totalCents, 0);
  const memberSince = profile ? formatDate(profile.createdAt, { month: 'short', year: 'numeric' }) : '—';

  const nextTripDate = reservations
    .filter((r) => new Date(r.departureDate).getTime() > Date.now())
    .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())[0];

  return (
    <View>
      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display }]}>Your stats</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Stat label="Trips" value={String(completedTrips.length + rentals.length)} theme={theme} />
        <Stat label="Total spent" value={formatCents(totalSpentCents)} theme={theme} />
        <Stat label="Member since" value={memberSince} theme={theme} />
      </View>

      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
        Your deals
      </Text>
      <Card style={{ marginTop: 10 }} variant="inverse">
        <Badge label="WELCOME10" variant="accent" />
        <Text style={{ color: theme.colors.inverseText, fontFamily: theme.fonts.body, marginTop: 8 }}>
          10% off your next valet booking — apply at checkout.
        </Text>
      </Card>

      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
        Car care cross-sell
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Card style={{ flex: 1 }} onPress={() => router.push('/book/valet/origin')}>
          <Ionicons name="sparkles-outline" size={20} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600', marginTop: 8 }}>Full Detail</Text>
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 12, marginTop: 2 }}>$499.95</Text>
        </Card>
        <Card style={{ flex: 1 }} onPress={() => router.push('/book/valet/origin')}>
          <Ionicons name="flash-outline" size={20} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600', marginTop: 8 }}>EV Charge</Text>
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 12, marginTop: 2 }}>$45.95</Text>
        </Card>
      </View>

      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
        Suggestions
      </Text>
      <Card style={{ marginTop: 10 }}>
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600' }}>Save your vehicle</Text>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 4 }}>
          Add your car details once to skip re-entering them every booking.
        </Text>
        <Button
          label="Add a vehicle"
          variant="secondary"
          size="small"
          fullWidth={false}
          style={{ marginTop: 10 }}
          onPress={() => router.push('/(tabs)/account/saved-vehicles')}
        />
      </Card>

      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
        Plan your next trip
      </Text>
      <Card style={{ marginTop: 10 }}>
        {nextTripDate ? (
          <>
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600' }}>
              Upcoming: {formatDate(nextTripDate.departureDate)}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 4 }}>
              Terminal {nextTripDate.terminal?.code ?? '—'} — tap to manage.
            </Text>
            <Button
              label="View trip"
              variant="secondary"
              size="small"
              fullWidth={false}
              style={{ marginTop: 10 }}
              onPress={() => router.push(`/trip/${nextTripDate.id}`)}
            />
          </>
        ) : (
          <>
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600' }}>No trips planned yet</Text>
            <Button
              label="Book valet"
              variant="secondary"
              size="small"
              fullWidth={false}
              style={{ marginTop: 10 }}
              onPress={() => router.push('/book/valet/origin')}
            />
          </>
        )}
      </Card>
    </View>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.radii.card, padding: 12, alignItems: 'center' }}>
      <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontWeight: '700', fontSize: 16 }}>{value}</Text>
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 11, marginTop: 4, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { fontSize: 20, fontWeight: '700' },
});
