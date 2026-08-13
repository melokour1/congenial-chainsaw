import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCents, OFF_SITE_ORIGINS } from '@laxvaletcare/shared';
import { api } from '../../../src/lib/api';
import { useDriver } from '../../../src/lib/DriverProvider';
import { useJobs } from '../../../src/lib/JobsProvider';
import { ACTION_COPY, ActionType, DEPARTURE_SEQUENCE, RETURN_SEQUENCE } from '../../../src/lib/actionCopy';
import { localId } from '../../../src/lib/id';
import { COLORS, RADII } from '../../../src/lib/theme';
import { Badge } from '../../../src/components/ui/Badge';
import { Card } from '../../../src/components/ui/Card';
import { ConfirmDialog } from '../../../src/components/ui/ConfirmDialog';
import { AddOnChecklist } from '../../../src/components/driver/AddOnChecklist';
import { VehicleInfoEditor } from '../../../src/components/driver/VehicleInfoEditor';
import { CameraCaptureSheet } from '../../../src/components/driver/CameraCaptureSheet';

const ETA_LABEL: Record<string, string> = {
  UNDER_15: 'under 15 min',
  MIN_15_30: '15–30 min',
  MIN_30_45: '30–45 min',
  PLUS_45: '45+ min',
};

const STATUS_PHRASE: Record<string, string> = {
  LIVE: 'Heading to Terminal',
  CHECKED_IN: 'Vehicle parked',
  DELIVERING: 'Heading with vehicle',
  DELIVERED_PENDING_CLOSE: 'Delivered',
};

function fmtDate(d: string) {
  return new Date(d).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function JobDetail() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'DEPARTURE' | 'RETURN' }>();
  const { profile } = useDriver();
  const { jobs, patchJob, refetch } = useJobs();
  const [flow, setFlow] = useState<{ action: ActionType; phase: 'photos' | 'confirm' } | null>(null);
  const [markingLanded, setMarkingLanded] = useState(false);

  const r = jobs.find((j) => j.id === id);

  if (!r) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.center}>
          <Text style={styles.notFound}>This job is no longer in your queue.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isDeparture = type === 'DEPARTURE';
  const meId = profile.id;
  const assignedValetId = isDeparture ? r.departureValetId : r.returnValetId;
  const assignedValet = isDeparture ? r.departureValet : r.returnValet;

  // Defensive: shouldn't normally happen (the jobs endpoint only returns the caller's own
  // jobs), but if the reservation got reassigned mid-session, render read-only.
  if (assignedValetId && assignedValetId !== meId) {
    const statusPhrase = STATUS_PHRASE[r.status] ?? r.status.replaceAll('_', ' ');
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Card>
            <Text style={styles.handledOff}>
              🟢 HANDLED BY {assignedValet?.fullName ?? 'another valet'} — {statusPhrase} at Terminal {r.terminal?.code ?? '—'}
            </Text>
            <Text style={styles.handledMeta}>{r.vehicleColor} {r.vehicleMake} {r.vehicleModel} · Booking {r.bookingCode}</Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const sequence = isDeparture ? DEPARTURE_SEQUENCE : RETURN_SEQUENCE;
  const doneActions = new Set(r.activityLogs.filter((l) => sequence.includes(l.action as ActionType)).map((l) => l.action));
  const nextAction = sequence.find((a) => !doneActions.has(a)) ?? null;

  const pickupPhotoCount = r.photos.filter((p) => p.stage === 'PICKUP').length;
  const returnPhotoCount = r.photos.filter((p) => p.stage === 'RETURN').length;
  const offSiteOrigin = r.originType !== 'LAX' ? OFF_SITE_ORIGINS.find((o) => o.type === r.originType) : null;

  const startAction = (action: ActionType) => {
    if (action === 'VEHICLE_RECEIVED' && pickupPhotoCount < 4) {
      setFlow({ action, phase: 'photos' });
    } else if (action === 'HEADING_WITH_VEHICLE' && returnPhotoCount < 4) {
      setFlow({ action, phase: 'photos' });
    } else {
      setFlow({ action, phase: 'confirm' });
    }
  };

  const runAction = async (action: ActionType) => {
    try {
      const data = await api.post<{ status: string }>(`/api/reservations/${r.id}/actions`, { action });
      patchJob(r.id, {
        status: data.status,
        activityLogs: [...r.activityLogs, { id: localId(), reservationId: r.id, actorId: meId, action, detail: null, createdAt: new Date().toISOString() }],
      });
      if (action === 'VEHICLE_DELIVERED') {
        setTimeout(() => router.back(), 400);
      }
    } finally {
      setFlow(null);
    }
  };

  const markFlightLanded = async () => {
    setMarkingLanded(true);
    try {
      const flightLandedAt = new Date().toISOString();
      await api.patch(`/api/reservations/${r.id}`, { flightLandedAt });
      patchJob(r.id, { flightLandedAt });
    } finally {
      setMarkingLanded(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.eyebrow}>{isDeparture ? 'DEPARTURE' : 'RETURN'}</Text>
            <Text style={styles.vehicle}>{r.vehicleColor} {r.vehicleMake} {r.vehicleModel}</Text>
            <Text style={styles.date}>{isDeparture ? fmtDate(r.departureDate) : fmtDate(r.returnDateEstimate)}</Text>
          </View>
          <Badge label={r.status.replaceAll('_', ' ')} variant="outline" />
        </View>

        {isDeparture && r.customerOnWayAt && (
          <Banner color="blue" text={`🚗 Customer on the way${r.customerEtaMinutes ? ` — ETA ${r.customerEtaMinutes} min` : r.customerEtaBand ? ` — ETA ${ETA_LABEL[r.customerEtaBand]}` : ''}`} />
        )}
        {!isDeparture && r.flightLandedAt && !r.customerAtCurbAt && <Banner color="gold" text="🟠 FLIGHT LANDED" bold />}
        {!isDeparture && r.customerAtCurbAt && (
          <Banner color="red" text={`🔴 AT THE CURB ${r.curbLocationDetail ? `— ${r.curbLocationDetail}` : ''}`} bold />
        )}
        {!isDeparture && !r.flightLandedAt && (
          <TouchableOpacity onPress={markFlightLanded} disabled={markingLanded} style={styles.landedButton}>
            <Text style={styles.landedButtonLabel}>{markingLanded ? 'Marking…' : 'Mark flight landed'}</Text>
          </TouchableOpacity>
        )}
        {offSiteOrigin && <Banner color="gold" text={`⚠️ Off-site pickup — ${offSiteOrigin.name}, ${offSiteOrigin.address}`} />}

        <Card>
          <View style={styles.customerRow}>
            <Text style={styles.customerName}>{r.customer.fullName}</Text>
            <View style={styles.contactRow}>
              {r.customer.phone && (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${r.customer.phone}`)}>
                  <Ionicons name="call-outline" size={18} color={COLORS.gold} />
                </TouchableOpacity>
              )}
              {r.customer.phone && (
                <TouchableOpacity onPress={() => Linking.openURL(`sms:${r.customer.phone}`)}>
                  <Ionicons name="chatbubble-outline" size={18} color={COLORS.gold} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${r.customer.email}`)}>
                <Ionicons name="mail-outline" size={18} color={COLORS.gold} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.customerMeta}>Booking {r.bookingCode} · {r.serviceTier.replace('_', ' ')}</Text>
          <Text style={styles.customerMeta}>
            {isDeparture ? `${r.departingAirline ?? '—'} ${r.departingFlightNumber ?? ''}` : `${r.returningAirline ?? '—'} ${r.returningFlightNumber ?? ''}`}
            {' · '}Terminal {r.terminal?.code ?? '—'}
          </Text>
          {r.bagsInfo && <Text style={styles.customerMeta}>Bags: {r.bagsInfo}</Text>}
          <Text style={styles.customerMeta}>Gratuity: {formatCents(r.gratuityCents)}</Text>
        </Card>

        <VehicleInfoEditor reservation={r} onSaved={(patch) => patchJob(r.id, patch)} />

        <AddOnChecklist reservation={r} onCompleted={(addOnId) => patchJob(r.id, { addOns: r.addOns.map((a) => (a.id === addOnId ? { ...a, status: 'COMPLETE', completedAt: new Date().toISOString() } : a)) })} />

        <View style={{ gap: 10 }}>
          {sequence.map((action) => {
            const done = doneActions.has(action);
            const isNext = action === nextAction;
            const copy = ACTION_COPY[action];
            const withPhotos = action === 'VEHICLE_RECEIVED' || action === 'HEADING_WITH_VEHICLE';
            return (
              <TouchableOpacity
                key={action}
                onPress={() => isNext && startAction(action)}
                disabled={!isNext}
                style={[
                  styles.actionButton,
                  done ? styles.actionDone : isNext ? styles.actionNext : styles.actionPending,
                ]}
              >
                <Text style={[styles.actionLabel, { color: done ? COLORS.green : isNext ? COLORS.black : COLORS.textMuted }]}>
                  {done ? '✓ ' : withPhotos ? '📷 ' : ''}{copy.buttonLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {flow?.phase === 'photos' && (
        <CameraCaptureSheet
          title={flow.action === 'VEHICLE_RECEIVED' ? 'Pickup photos (4+ required)' : 'Return photos — take before heading out (4+ required)'}
          minPhotos={4}
          stage={flow.action === 'VEHICLE_RECEIVED' ? 'PICKUP' : 'RETURN'}
          reservationId={r.id}
          onDone={(urls) => {
            patchJob(r.id, {
              photos: [
                ...r.photos,
                ...urls.map((url) => ({ id: localId(), reservationId: r.id, url, stage: (flow.action === 'VEHICLE_RECEIVED' ? 'PICKUP' : 'RETURN') as 'PICKUP' | 'RETURN', takenByValetId: meId, createdAt: new Date().toISOString() })),
              ],
            });
            setFlow({ action: flow.action, phase: 'confirm' });
          }}
          onCancel={() => setFlow(null)}
        />
      )}

      {flow?.phase === 'confirm' && (
        <ConfirmDialog
          title={ACTION_COPY[flow.action].confirmTitle}
          sendMessage={ACTION_COPY[flow.action].body(r)}
          message={flow.action === 'AT_CURBSIDE_RETURN' ? 'The return photos you took earlier will be shown to the customer now.' : undefined}
          onConfirm={() => runAction(flow.action)}
          onCancel={() => setFlow(null)}
        />
      )}
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        <Text style={styles.backLabel}>Jobs</Text>
      </TouchableOpacity>
    </View>
  );
}

function Banner({ color, text, bold }: { color: 'blue' | 'gold' | 'red'; text: string; bold?: boolean }) {
  const palette = { blue: { bg: 'rgba(91,156,255,0.15)', fg: COLORS.blue }, gold: { bg: 'rgba(224,164,88,0.15)', fg: COLORS.gold }, red: { bg: 'rgba(255,91,91,0.15)', fg: COLORS.red } }[color];
  return (
    <View style={[styles.banner, { backgroundColor: palette.bg }]}>
      <Text style={[styles.bannerText, { color: palette.fg, fontWeight: bold ? '700' : '500' }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    fontSize: 15,
    color: COLORS.white,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFound: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: COLORS.gold,
  },
  vehicle: {
    marginTop: 2,
    fontFamily: 'Jost_700Bold',
    fontSize: 19,
    color: COLORS.white,
  },
  date: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  handledOff: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green,
  },
  handledMeta: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  banner: {
    borderRadius: RADII.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerText: {
    fontSize: 13,
  },
  landedButton: {
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  landedButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 16,
  },
  customerMeta: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  actionButton: {
    height: 56,
    borderRadius: RADII.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDone: {
    borderWidth: 1,
    borderColor: 'rgba(61,220,132,0.4)',
    backgroundColor: 'rgba(61,220,132,0.1)',
  },
  actionNext: {
    backgroundColor: COLORS.white,
  },
  actionPending: {
    backgroundColor: COLORS.surfaceAlt,
    opacity: 0.5,
  },
  actionLabel: {
    fontFamily: 'Jost_700Bold',
    fontSize: 14,
  },
});
