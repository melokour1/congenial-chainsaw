import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/lib/ThemeProvider';
import { api, ApiError } from '../../src/lib/api';
import { formatCents, formatDate, formatDateTime, RESERVATION_STATUS_LABEL } from '../../src/lib/format';
import { ScreenContainer, StepHeader, Card, Badge, Button, Divider, EmptyState, Input } from '../../src/components/ui';
import type { Reservation } from '../../src/lib/types';

const ETA_OPTIONS: { value: 'UNDER_15' | 'MIN_15_30' | 'MIN_30_45' | 'PLUS_45'; label: string }[] = [
  { value: 'UNDER_15', label: 'Under 15 min' },
  { value: 'MIN_15_30', label: '15–30 min' },
  { value: 'MIN_30_45', label: '30–45 min' },
  { value: 'PLUS_45', label: '45+ min' },
];

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'accent' | 'success' | 'danger' | 'outline'> = {
  CONFIRMED: 'outline',
  UPDATED: 'outline',
  LIVE: 'accent',
  CHECKED_IN: 'accent',
  IN_TRIP: 'accent',
  RETURN_REQUESTED: 'accent',
  DELIVERING: 'accent',
  DELIVERED_PENDING_CLOSE: 'accent',
  CLOSED: 'success',
  CANCELLED: 'danger',
};

export default function TripDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const data = await api.get<Reservation>(`/api/reservations/${id}`);
      setReservation(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <StepHeader title="Trip details" onBack={() => router.back()} />
      </ScreenContainer>
    );
  }

  if (error || !reservation) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <StepHeader title="Trip details" onBack={() => router.back()} />
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load this trip"
          body={error ?? 'Something went wrong.'}
          actionLabel="Try again"
          onAction={load}
        />
      </ScreenContainer>
    );
  }

  const r = reservation;
  const rating = Array.isArray(r.rating) ? r.rating[0] : r.rating;

  return (
    <ScreenContainer edges={['top', 'bottom']} onRefresh={load} refreshing={loading}>
      <StepHeader title="Trip details" onBack={() => router.back()} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View>
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13 }}>Confirmation code</Text>
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 20, fontWeight: '700', letterSpacing: 1 }}>
            {r.bookingCode}
          </Text>
        </View>
        <Badge label={RESERVATION_STATUS_LABEL[r.status] ?? r.status} variant={STATUS_BADGE_VARIANT[r.status] ?? 'default'} />
      </View>

      <Card>
        <Row label="Vehicle" value={`${r.vehicleColor} ${r.vehicleMake} ${r.vehicleModel}`} theme={theme} />
        <Row label="Transmission" value={r.transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual'} theme={theme} />
        {r.plate ? <Row label="Plate" value={r.plate} theme={theme} /> : null}
        <Divider spacing={12} />
        <Row label="Origin" value={r.originType === 'LAX' ? `LAX${r.terminal ? ` — Terminal ${r.terminal.code}` : ''}` : r.originType} theme={theme} />
        {r.departingAirline ? (
          <Row label="Departing flight" value={`${r.departingAirline} ${r.departingFlightNumber ?? ''}`.trim()} theme={theme} />
        ) : null}
        <Row label="Departure" value={formatDate(r.departureDate)} theme={theme} />
        <Row label="Return (est.)" value={formatDate(r.returnDateEstimate)} theme={theme} />
      </Card>

      <View style={{ marginTop: 16 }}>
        <ActionCard reservation={r} theme={theme} onUpdated={load} />
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
          Price
        </Text>
        <Card>
          {r.priceBreakdown.lineItems.map((li, i) => (
            <Row key={i} label={li.label} value={formatCents(li.cents)} theme={theme} />
          ))}
          <Divider spacing={10} />
          <Row label="Subtotal" value={formatCents(r.priceBreakdown.subtotalCents)} theme={theme} muted />
          <Row label="Tax" value={formatCents(r.priceBreakdown.taxCents)} theme={theme} muted />
          <Row label="Service fee" value={formatCents(r.priceBreakdown.serviceFeeCents)} theme={theme} muted />
          {r.priceBreakdown.gratuityCents > 0 ? (
            <Row label="Gratuity" value={formatCents(r.priceBreakdown.gratuityCents)} theme={theme} muted />
          ) : null}
          <Divider spacing={10} />
          <Row label="Total" value={formatCents(r.totalCents)} theme={theme} bold />
        </Card>
      </View>

      {rating ? (
        <View style={{ marginTop: 16 }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Ionicons key={n} name={n <= rating.stars ? 'star' : 'star-outline'} size={18} color={theme.colors.text} />
              ))}
            </View>
            {rating.comment ? (
              <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 8 }}>
                "{rating.comment}"
              </Text>
            ) : null}
          </Card>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

function Row({
  label,
  value,
  theme,
  muted,
  bold,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>['theme'];
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text
        style={{
          color: muted ? theme.colors.textMuted : theme.colors.text,
          fontFamily: theme.fonts.body,
          fontSize: bold ? 15 : 14,
          fontWeight: bold ? '700' : '400',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: theme.colors.text,
          fontFamily: theme.fonts.body,
          fontSize: bold ? 15 : 14,
          fontWeight: bold ? '700' : '600',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * The two customer-facing moments in a valet trip's lifecycle (spec 1.9/1.10):
 *  - "I'm on my way" (heading TO the airport) — dispatches the departure valet job.
 *  - "I'm at the curb" (back at the airport, wants the car returned) — alerts the
 *    already-assigned return valet. Shown once the car has actually been checked in
 *    (IN_TRIP or later) so a customer can't request their car before it's even parked.
 * Outside those windows we just show where things stand — nothing to tap.
 */
function ActionCard({
  reservation,
  theme,
  onUpdated,
}: {
  reservation: Reservation;
  theme: ReturnType<typeof useTheme>['theme'];
  onUpdated: () => void;
}) {
  const [etaBand, setEtaBand] = useState<typeof ETA_OPTIONS[number]['value'] | null>(null);
  const [curbDetail, setCurbDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  const canGoOnWay = (reservation.status === 'CONFIRMED' || reservation.status === 'UPDATED') && !reservation.customerOnWayAt;
  const canGoToCurb =
    ['LIVE', 'CHECKED_IN', 'IN_TRIP'].includes(reservation.status) && !reservation.customerAtCurbAt;
  const canRate = reservation.status === 'CLOSED' && !reservation.rating;

  async function submitOnWay() {
    if (!etaBand) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post(`/api/reservations/${reservation.id}/on-way`, { etaBand });
      onUpdated();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAtCurb() {
    if (!curbDetail.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post(`/api/reservations/${reservation.id}/at-curb`, {
        terminalCode: reservation.terminal?.code ?? 'N/A',
        curbLocationDetail: curbDetail.trim(),
      });
      onUpdated();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitRating() {
    if (!stars) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await api.post(`/api/reservations/${reservation.id}/rating`, { stars, comment: comment.trim() || undefined });
      onUpdated();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (canGoOnWay) {
    return (
      <Card>
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700' }}>
          Heading to the airport?
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 4, marginBottom: 14 }}>
          Let us know your ETA and we'll have a valet ready.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {ETA_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setEtaBand(opt.value)}
              style={{
                minHeight: 40, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center',
                borderRadius: theme.radii.card, borderWidth: 1,
                borderColor: etaBand === opt.value ? theme.colors.text : theme.colors.border,
                backgroundColor: etaBand === opt.value ? theme.colors.inverseBackground : theme.colors.surface,
              }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, fontWeight: '600', color: etaBand === opt.value ? theme.colors.inverseText : theme.colors.text }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {actionError ? (
          <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginBottom: 10 }}>{actionError}</Text>
        ) : null}
        <Button label="I'm on my way" onPress={submitOnWay} disabled={!etaBand} loading={submitting} />
      </Card>
    );
  }

  if (reservation.customerOnWayAt && !canGoToCurb && !['RETURN_REQUESTED', 'DELIVERING', 'DELIVERED_PENDING_CLOSE', 'CLOSED'].includes(reservation.status)) {
    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600' }}>
            On the way — {formatDateTime(reservation.customerOnWayAt)}
          </Text>
        </View>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 6 }}>
          A valet is being dispatched to meet you.
        </Text>
      </Card>
    );
  }

  if (canGoToCurb) {
    return (
      <Card>
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700' }}>
          Back at the airport?
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 4, marginBottom: 14 }}>
          Tell us where to meet you and we'll bring your car around.
        </Text>
        <Input
          placeholder="e.g. Terminal 4 arrivals, lower level"
          value={curbDetail}
          onChangeText={setCurbDetail}
        />
        {actionError ? (
          <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginBottom: 10 }}>{actionError}</Text>
        ) : null}
        <Button label="I'm at the curb" onPress={submitAtCurb} disabled={!curbDetail.trim()} loading={submitting} />
      </Card>
    );
  }

  if (canRate) {
    return (
      <Card>
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700' }}>
          How was your trip?
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, marginBottom: 14 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setStars(n)} hitSlop={6}>
              <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={30} color={theme.colors.text} />
            </Pressable>
          ))}
        </View>
        <Input placeholder="Add a comment (optional)" value={comment} onChangeText={setComment} multiline />
        {actionError ? (
          <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginBottom: 10 }}>{actionError}</Text>
        ) : null}
        <Button label="Submit rating" onPress={submitRating} disabled={!stars} loading={submitting} />
      </Card>
    );
  }

  return (
    <Card>
      <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600' }}>
        {RESERVATION_STATUS_LABEL[reservation.status] ?? reservation.status}
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 4 }}>
        We'll update this page as your trip progresses.
      </Text>
    </Card>
  );
}
