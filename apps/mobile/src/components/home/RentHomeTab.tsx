import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/ThemeProvider';
import { useFleetVehicles } from '../../hooks/useFleetVehicles';
import { formatCents } from '../../lib/format';
import { Card, Button, PlaceholderImage } from '../ui';

const CLASS_ORDER = ['ECONOMY', 'STANDARD', 'SUV', 'PREMIUM', 'LUXURY', 'VAN'];
const CLASS_LABEL: Record<string, string> = {
  ECONOMY: 'Economy',
  STANDARD: 'Standard',
  SUV: 'SUV',
  PREMIUM: 'Premium',
  LUXURY: 'Luxury',
  VAN: 'Van',
};

const DELIVERY_METHODS: { icon: keyof typeof Ionicons.glyphMap; label: string; body: string }[] = [
  { icon: 'business-outline', label: 'Pick up at our lot', body: 'Free — LAXValetCare Lot A, near LAX' },
  { icon: 'airplane-outline', label: 'Meet at LAX', body: 'Delivered curbside to your terminal' },
  { icon: 'home-outline', label: 'Home / hotel delivery', body: 'Delivered anywhere in LA County' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Pick your dates & class', body: 'Browse the fleet and choose delivery.' },
  { step: '2', title: 'Verify your identity', body: 'License + selfie, once — reused on future rentals.' },
  { step: '3', title: 'Drive off', body: 'Sign digitally and go — no counter, no lines.' },
];

export function RentHomeTab() {
  const { theme } = useTheme();
  const router = useRouter();
  const { byClass, loading } = useFleetVehicles();

  const classesWithVehicles = CLASS_ORDER.filter((c) => byClass[c]?.length);

  return (
    <View>
      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display }]}>Browse the fleet</Text>
      {!loading && classesWithVehicles.length === 0 ? (
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, marginTop: 8 }}>
          No vehicles available right now — check back soon.
        </Text>
      ) : null}
      <View style={{ gap: 10, marginTop: 10 }}>
        {(classesWithVehicles.length ? classesWithVehicles : CLASS_ORDER).map((cls) => {
          const vehicles = byClass[cls] ?? [];
          const cheapest = vehicles[0];
          return (
            <Card
              key={cls}
              onPress={() => router.push({ pathname: '/book/rental/dates', params: { rentalClass: cls } })}
            >
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <PlaceholderImage icon="car-sport-outline" style={{ width: 64, height: 64 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16 }}>
                    {CLASS_LABEL[cls]}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 2 }}>
                    {cheapest ? `${cheapest.make} ${cheapest.model} or similar` : 'Coming soon'}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700' }}>
                  {cheapest ? `${formatCents(cheapest.dailyRateCents)}/day` : '—'}
                </Text>
              </View>
            </Card>
          );
        })}
      </View>

      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
        Delivery options
      </Text>
      <View style={{ gap: 10, marginTop: 10 }}>
        {DELIVERY_METHODS.map((d) => (
          <Card key={d.label}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Ionicons name={d.icon} size={22} color={theme.colors.text} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600' }}>{d.label}</Text>
                <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 2 }}>{d.body}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Card style={{ marginTop: theme.spacing(4) }}>
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700' }}>Renting longer?</Text>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 4 }}>
          Save 17.5% on rentals of 7+ days, and 35% on rentals of 30+ days — applied automatically at checkout.
        </Text>
      </Card>

      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
        How it works
      </Text>
      <View style={{ gap: 10, marginTop: 10 }}>
        {HOW_IT_WORKS.map((s) => (
          <View key={s.step} style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: theme.colors.text,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: theme.colors.inverseText, fontWeight: '700', fontFamily: theme.fonts.body }}>{s.step}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600' }}>{s.title}</Text>
              <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 2 }}>{s.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button label="Start a rental" onPress={() => router.push('/book/rental/dates')} style={{ marginTop: theme.spacing(6) }} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { fontSize: 20, fontWeight: '700' },
});
