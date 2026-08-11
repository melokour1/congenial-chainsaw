import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/lib/ThemeProvider';
import { api, ApiError } from '../../src/lib/api';
import { formatCents, formatDate, RENTAL_STATUS_LABEL } from '../../src/lib/format';
import { ScreenContainer, StepHeader, Card, Badge, Button, Divider, EmptyState } from '../../src/components/ui';
import type { RentalBooking } from '../../src/lib/types';

const STATUS_BADGE_VARIANT: Record<string, 'default' | 'accent' | 'success' | 'danger' | 'outline'> = {
  PENDING_VERIFICATION: 'outline',
  PENDING_INSURANCE: 'outline',
  READY: 'accent',
  PICKED_UP: 'accent',
  OVERDUE: 'danger',
  RETURNED: 'success',
  CLOSED: 'success',
  CANCELLED: 'danger',
};

const DELIVERY_LABEL: Record<string, string> = {
  LOT: 'Pick up at our lot',
  LAX: 'Meet at LAX',
  HOME: 'Delivered to me',
};

export default function RentalDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [rental, setRental] = useState<RentalBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const data = await api.get<RentalBooking>(`/api/rentals/${id}`);
      setRental(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Failed to load rental');
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
        <StepHeader title="Rental details" onBack={() => router.back()} />
      </ScreenContainer>
    );
  }

  if (error || !rental) {
    return (
      <ScreenContainer edges={['top', 'bottom']}>
        <StepHeader title="Rental details" onBack={() => router.back()} />
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load this rental"
          body={error ?? 'Something went wrong.'}
          actionLabel="Try again"
          onAction={load}
        />
      </ScreenContainer>
    );
  }

  const r = rental;
  const days = Math.max(1, Math.ceil((new Date(r.returnDate).getTime() - new Date(r.pickupDate).getTime()) / 86400000));

  return (
    <ScreenContainer edges={['top', 'bottom']} onRefresh={load} refreshing={loading}>
      <StepHeader title="Rental details" onBack={() => router.back()} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View>
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13 }}>Confirmation code</Text>
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 20, fontWeight: '700', letterSpacing: 1 }}>
            {r.bookingCode}
          </Text>
        </View>
        <Badge label={RENTAL_STATUS_LABEL[r.status] ?? r.status} variant={STATUS_BADGE_VARIANT[r.status] ?? 'default'} />
      </View>

      <Card>
        <Row
          label="Vehicle"
          value={r.fleetVehicle ? `${r.fleetVehicle.color} ${r.fleetVehicle.make} ${r.fleetVehicle.model}` : '—'}
          theme={theme}
        />
        {r.fleetVehicle ? <Row label="Class" value={titleCase(r.fleetVehicle.class)} theme={theme} /> : null}
        <Divider spacing={12} />
        <Row label="Pickup" value={formatDate(r.pickupDate)} theme={theme} />
        <Row label="Return" value={formatDate(r.returnDate)} theme={theme} />
        <Row label="Duration" value={`${days} day${days === 1 ? '' : 's'}`} theme={theme} />
        <Row label="Delivery" value={DELIVERY_LABEL[r.deliveryMethod] ?? r.deliveryMethod} theme={theme} />
        {r.deliveryAddress ? <Row label="Address" value={r.deliveryAddress} theme={theme} /> : null}
      </Card>

      <View style={{ marginTop: 16 }}>
        <StatusCard rental={r} router={router} theme={theme} />
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
          <Divider spacing={10} />
          <Row label="Total" value={formatCents(r.totalCents)} theme={theme} bold />
          <Row label="Security deposit hold" value={formatCents(r.depositHoldCents)} theme={theme} muted />
        </Card>
      </View>
    </ScreenContainer>
  );
}

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
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

/** What the customer needs to do next, driven purely by status — no editing here, just the current stage and its call to action. */
function StatusCard({
  rental,
  router,
  theme,
}: {
  rental: RentalBooking;
  router: ReturnType<typeof useRouter>;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  if (rental.status === 'PENDING_VERIFICATION') {
    return (
      <Card>
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700' }}>
          Verification needed
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 4, marginBottom: 14 }}>
          We need a quick ID check before this rental can move forward.
        </Text>
        <Button label="Verify my identity" onPress={() => router.push('/(tabs)/account/verification')} />
      </Card>
    );
  }

  if (rental.status === 'PENDING_INSURANCE') {
    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="time-outline" size={18} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600' }}>
            Insurance under review
          </Text>
        </View>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 6 }}>
          {rental.insuranceRejectionReason
            ? `We couldn't verify your coverage: ${rental.insuranceRejectionReason}`
            : "We're confirming your coverage. This is usually quick — we'll notify you once it's approved."}
        </Text>
      </Card>
    );
  }

  if (rental.status === 'READY') {
    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600' }}>
            Ready for pickup
          </Text>
        </View>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 6 }}>
          Your car will be ready on {formatDate(rental.pickupDate)}.
        </Text>
      </Card>
    );
  }

  if (rental.status === 'PICKED_UP') {
    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="car-outline" size={18} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600' }}>
            Currently rented
          </Text>
        </View>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 6 }}>
          Due back {formatDate(rental.returnDate)}.
        </Text>
      </Card>
    );
  }

  if (rental.status === 'OVERDUE') {
    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="alert-circle-outline" size={18} color={theme.colors.danger} />
          <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600' }}>
            Overdue
          </Text>
        </View>
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 6 }}>
          This was due back {formatDate(rental.returnDate)}. Please return it as soon as possible to avoid extra fees.
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600' }}>
        {RENTAL_STATUS_LABEL[rental.status] ?? rental.status}
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 4 }}>
        {rental.status === 'RETURNED' || rental.status === 'CLOSED' ? 'Thanks for renting with us!' : 'This rental has ended.'}
      </Text>
    </Card>
  );
}
