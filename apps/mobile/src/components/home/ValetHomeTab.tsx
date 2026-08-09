import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/ThemeProvider';
import { useReservations, isActiveReservation } from '../../hooks/useReservations';
import { usePromoCodes } from '../../hooks/usePromoCodes';
import { getPricingConfig, FALLBACK_PRICING } from '../../lib/pricing';
import { formatCents, formatDate, RESERVATION_STATUS_LABEL } from '../../lib/format';
import { Card, Badge, Button, EmptyState } from '../ui';
import type { PricingConfig } from '@laxvaletcare/shared';

const QUICK_ACTIONS: { label: string; sub: string; icon: keyof typeof Ionicons.glyphMap; tier?: string; crossAirport?: boolean }[] = [
  { label: 'Valet', sub: 'Standard', icon: 'car-outline' },
  { label: 'VIP Express', sub: '+$500/person', icon: 'flash-outline', tier: 'VIP_EXPRESS' },
  { label: 'VIP Elite', sub: '+$2,000/person', icon: 'star-outline', tier: 'VIP_ELITE' },
  { label: 'Cross-Airport', sub: 'BUR / SNA', icon: 'airplane-outline', crossAirport: true },
];

const TRUST_BADGES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'shield-checkmark-outline', label: 'Fully insured' },
  { icon: 'people-outline', label: 'Background-checked valets' },
  { icon: 'headset-outline', label: '24/7 support' },
  { icon: 'trending-up-outline', label: '50,000+ trips' },
];

export function ValetHomeTab() {
  const { theme } = useTheme();
  const router = useRouter();
  const { reservations, loading } = useReservations();
  const { promoCodes } = usePromoCodes();
  const [later, setLater] = useState(false);
  const [pricing, setPricing] = useState<PricingConfig>(FALLBACK_PRICING);

  useEffect(() => {
    getPricingConfig().then(setPricing);
  }, []);

  const upcoming = reservations.find(isActiveReservation);
  const recent = reservations.filter((r) => r.status === 'CLOSED').slice(0, 3);

  const startBooking = (tier?: string) => {
    router.push({ pathname: '/book/valet/origin', params: tier ? { presetTier: tier } : {} });
  };

  return (
    <View>
      {/* Search bar */}
      <Pressable
        onPress={() => startBooking()}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderRadius: theme.radii.card, minHeight: theme.minTouchTarget }]}
      >
        <Ionicons name="search-outline" size={20} color={theme.colors.textMuted} />
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 16, flex: 1 }}>
          Which terminal?
        </Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setLater((v) => !v);
          }}
          style={[
            styles.laterToggle,
            { backgroundColor: later ? theme.colors.text : 'transparent', borderColor: theme.colors.border },
          ]}
        >
          <Text style={{ fontSize: 12 }}>📅</Text>
          <Text
            style={{
              color: later ? theme.colors.inverseText : theme.colors.textMuted,
              fontFamily: theme.fonts.body,
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            Later
          </Text>
        </Pressable>
      </Pressable>

      {/* Upcoming booking banner */}
      {upcoming ? (
        <Card style={{ marginTop: theme.spacing(4) }} variant="inverse">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Badge label={RESERVATION_STATUS_LABEL[upcoming.status] ?? upcoming.status} variant="accent" />
              <Text style={{ color: theme.colors.inverseText, fontFamily: theme.fonts.display, fontSize: 18, fontWeight: '700', marginTop: 8 }}>
                {upcoming.vehicleMake} {upcoming.vehicleModel}
              </Text>
              <Text style={{ color: theme.colors.inverseText, opacity: 0.7, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 2 }}>
                {formatDate(upcoming.departureDate)} · Terminal {upcoming.terminal?.code ?? '—'}
              </Text>
            </View>
            <Button
              label="Manage"
              size="small"
              fullWidth={false}
              variant="secondary"
              style={{ borderColor: theme.colors.inverseText }}
              onPress={() => router.push(`/trip/${upcoming.id}`)}
            />
          </View>
        </Card>
      ) : null}

      {/* Recent trips */}
      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
        Recent trips
      </Text>
      {loading ? null : recent.length === 0 ? (
        <EmptyState icon="time-outline" title="No trips yet" body="Your completed valet trips will show up here for quick rebooking." />
      ) : (
        <View style={{ gap: 10, marginTop: 10 }}>
          {recent.map((r) => (
            <Card key={r.id} onPress={() => startBooking()}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600' }}>
                    {r.vehicleMake} {r.vehicleModel} · Terminal {r.terminal?.code ?? '—'}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 2 }}>
                    {formatDate(r.departureDate)}
                  </Text>
                </View>
                <Ionicons name="refresh-outline" size={18} color={theme.colors.textMuted} />
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Quick actions */}
      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
        Quick actions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
        {QUICK_ACTIONS.map((qa) => (
          <Pressable
            key={qa.label}
            onPress={() => startBooking(qa.tier)}
            style={[styles.quickAction, { backgroundColor: theme.colors.surface, borderRadius: theme.radii.card, borderColor: theme.colors.border }]}
          >
            <Ionicons name={qa.icon} size={22} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700', marginTop: 8 }}>{qa.label}</Text>
            <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 12, marginTop: 2 }}>{qa.sub}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Upgrade your trip — car care add-ons */}
      <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
        Upgrade your trip
      </Text>
      <View style={{ gap: 10, marginTop: 10 }}>
        <Card>
          <Row label="Hand Wash" price={formatCents(pricing.carCare.handWashCents)} icon="water-outline" theme={theme} />
        </Card>
        <Card>
          <Row label="Full Detail" price={formatCents(pricing.carCare.fullDetailCents)} icon="sparkles-outline" theme={theme} />
        </Card>
        <Card>
          <Row label="EV Charge" price={formatCents(pricing.carCare.evChargeCents)} icon="flash-outline" theme={theme} />
        </Card>
      </View>

      {/* Promo carousel */}
      {promoCodes.length > 0 ? (
        <>
          <Text style={[styles.sectionHeader, { color: theme.colors.text, fontFamily: theme.fonts.display, marginTop: theme.spacing(6) }]}>
            Offers for you
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
            {promoCodes.map((p) => (
              <Card key={p.id} style={{ width: 220 }} variant="inverse">
                <Badge label={p.code} variant="accent" />
                <Text style={{ color: theme.colors.inverseText, fontFamily: theme.fonts.body, marginTop: 8, fontSize: 14 }}>{p.description}</Text>
              </Card>
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* Trust badges */}
      <View style={[styles.trustRow, { marginTop: theme.spacing(6) }]}>
        {TRUST_BADGES.map((b) => (
          <View key={b.label} style={styles.trustItem}>
            <Ionicons name={b.icon} size={20} color={theme.colors.textMuted} />
            <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 11, textAlign: 'center', marginTop: 4 }}>
              {b.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Row({ label, price, icon, theme }: { label: string; price: string; icon: keyof typeof Ionicons.glyphMap; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name={icon} size={18} color={theme.colors.text} />
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '600' }}>{label}</Text>
      </View>
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body }}>{price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 },
  laterToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  sectionHeader: { fontSize: 20, fontWeight: '700' },
  quickAction: { width: 120, padding: 14, borderWidth: 1 },
  trustRow: { flexDirection: 'row', justifyContent: 'space-between' },
  trustItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
});
