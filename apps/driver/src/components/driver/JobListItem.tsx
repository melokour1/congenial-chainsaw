import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { assignmentNeedsAction } from '../../lib/actionCopy';
import { COLORS, RADII } from '../../lib/theme';
import type { Assignment } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'gold' | 'green' | 'blue' | 'red' | 'outline' }> = {
  CONFIRMED: { label: 'Confirmed', variant: 'outline' },
  LIVE: { label: 'Live', variant: 'blue' },
  CHECKED_IN: { label: 'Checked in', variant: 'green' },
  DELIVERING: { label: 'Delivering', variant: 'gold' },
  DELIVERED_PENDING_CLOSE: { label: 'Delivered', variant: 'green' },
  CLOSED: { label: 'Closed', variant: 'default' },
};

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function JobListItem({ assignment, onPress }: { assignment: Assignment; onPress: () => void }) {
  const { type, reservation: r } = assignment;
  const isDeparture = type === 'DEPARTURE';
  const badge = STATUS_BADGE[r.status] ?? { label: r.status, variant: 'default' as const };
  const needsAction = assignmentNeedsAction(type, r.activityLogs);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.type}>{isDeparture ? 'DEPARTURE' : 'RETURN'}</Text>
          <Text style={styles.vehicle}>{r.vehicleColor} {r.vehicleMake} {r.vehicleModel}</Text>
        </View>
        <Badge label={badge.label} variant={badge.variant} />
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.meta}>
          {r.customer.fullName} · Terminal {r.terminal?.code ?? '—'} · {fmtTime(isDeparture ? r.departureDate : r.returnDateEstimate)}
        </Text>
        {needsAction && <View style={styles.needsActionDot} />}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  type: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: COLORS.gold,
  },
  vehicle: {
    marginTop: 2,
    fontFamily: 'Jost_700Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  needsActionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
});
