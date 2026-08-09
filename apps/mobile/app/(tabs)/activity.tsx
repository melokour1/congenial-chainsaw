import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/lib/ThemeProvider';
import { useReservations } from '../../src/hooks/useReservations';
import { useRentals } from '../../src/hooks/useRentals';
import { formatCents, formatDate, RESERVATION_STATUS_LABEL, RENTAL_STATUS_LABEL } from '../../src/lib/format';
import { ScreenContainer, SegmentedControl, Card, Badge, EmptyState } from '../../src/components/ui';
import type { Reservation } from '../../src/lib/types';
import type { RentalBooking } from '../../src/lib/types';

type Segment = 'upcoming' | 'active' | 'completed' | 'cancelled';

const ACTIVE_RES = new Set(['LIVE', 'CHECKED_IN', 'IN_TRIP', 'RETURN_REQUESTED', 'DELIVERING', 'DELIVERED_PENDING_CLOSE']);
const ACTIVE_RENTAL = new Set(['READY', 'PICKED_UP', 'OVERDUE']);

type Row = { kind: 'reservation'; item: Reservation } | { kind: 'rental'; item: RentalBooking };

export default function ActivityScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('upcoming');

  const { reservations, loading: resLoading, refresh: refreshRes } = useReservations();
  const { rentals, loading: rentalLoading, refresh: refreshRentals } = useRentals();

  const loading = resLoading || rentalLoading;
  const refresh = () => {
    refreshRes();
    refreshRentals();
  };

  const rows = useMemo<Row[]>(() => {
    const resRows: Row[] = reservations
      .filter((r) => {
        if (segment === 'upcoming') return r.status === 'CONFIRMED' || r.status === 'UPDATED';
        if (segment === 'active') return ACTIVE_RES.has(r.status);
        if (segment === 'completed') return r.status === 'CLOSED';
        return r.status === 'CANCELLED';
      })
      .map((item) => ({ kind: 'reservation' as const, item }));

    const rentalRows: Row[] = rentals
      .filter((r) => {
        if (segment === 'upcoming') return r.status === 'PENDING_VERIFICATION' || r.status === 'PENDING_INSURANCE';
        if (segment === 'active') return ACTIVE_RENTAL.has(r.status);
        if (segment === 'completed') return r.status === 'RETURNED' || r.status === 'CLOSED';
        return r.status === 'CANCELLED';
      })
      .map((item) => ({ kind: 'rental' as const, item }));

    return [...resRows, ...rentalRows].sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime());
  }, [reservations, rentals, segment]);

  return (
    <ScreenContainer
      edges={['top']}
      contentContainerStyle={{ flexGrow: 1 }}
      onRefresh={refresh}
      refreshing={loading}
    >
      <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 28, fontWeight: '700', marginBottom: 16 }}>
        Activity
      </Text>
      <SegmentedControl
        value={segment}
        onChange={setSegment}
        options={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'active', label: 'Active' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
      />

      <View style={{ marginTop: theme.spacing(5), gap: 10 }}>
        {!loading && rows.length === 0 ? (
          <EmptyState icon="calendar-outline" title="Nothing here yet" body={`No ${segment} trips or rentals.`} />
        ) : null}
        {rows.map((row) => {
          if (row.kind === 'reservation') {
            const r = row.item;
            return (
              <Card key={r.id} onPress={() => router.push(`/trip/${r.id}`)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Badge label="Valet" variant="outline" />
                    <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700', marginTop: 8 }}>
                      {r.vehicleMake} {r.vehicleModel}
                    </Text>
                    <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 2 }}>
                      {formatDate(r.departureDate)} · {RESERVATION_STATUS_LABEL[r.status] ?? r.status}
                    </Text>
                  </View>
                  <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700' }}>
                    {formatCents(r.totalCents)}
                  </Text>
                </View>
              </Card>
            );
          }
          const rt = row.item;
          return (
            <Card key={rt.id} onPress={() => router.push(`/rentals/${rt.id}`)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Badge label="Rental" variant="outline" />
                  <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700', marginTop: 8 }}>
                    {rt.fleetVehicle ? `${rt.fleetVehicle.make} ${rt.fleetVehicle.model}` : 'Rental vehicle'}
                  </Text>
                  <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 2 }}>
                    {formatDate(rt.pickupDate)} · {RENTAL_STATUS_LABEL[rt.status] ?? rt.status}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '700' }}>
                  {formatCents(rt.totalCents)}
                </Text>
              </View>
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
