import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../lib/api';
import { haptics } from '../../lib/haptics';
import { COLORS, RADII } from '../../lib/theme';
import { useToast } from '../../lib/ToastProvider';
import type { JobOfferSummary } from '../../lib/types';
import { Button } from '../ui/Button';

const COUNTDOWN_SECONDS = 60;

const JOB_TYPE_LABEL: Record<string, string> = {
  DEPARTURE: 'Departure — car drop-off',
  RETURN_STAGE1: 'Return — get ready',
  RETURN_STAGE2: 'Return — customer at curb',
};

/**
 * Full-screen 60s accept/decline alarm for a new job offer — the driver-app
 * equivalent of a ride-share incoming-request screen. Mirrors apps/web's
 * JobAlarmModal 1:1 (same countdown, same auto-expire, same endpoint), just
 * as a real full-screen native Modal instead of a fixed-position div, so it
 * interrupts on top of whatever screen the driver is on.
 */
export function JobAlarmModal({ offer, onResolved }: { offer: JobOfferSummary; onResolved: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [responding, setResponding] = useState(false);
  const resolvedRef = useRef(false);
  const { showToast } = useToast();

  const respond = async (response: 'ACCEPTED' | 'DECLINED' | 'EXPIRED') => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setResponding(true);
    if (response !== 'EXPIRED') haptics.tap();
    try {
      await api.post(`/api/queue/offers/${offer.id}/respond`, { response });
    } catch {
      // Best-effort — either way, stop blocking the driver on this screen; if
      // the response genuinely didn't land, the offer will just reappear on
      // the next jobs poll rather than leaving the driver stuck here.
      showToast("Couldn't reach LAXValetCare — this offer may reappear shortly.", 'error');
    } finally {
      onResolved();
    }
  };

  // A new offer landing is the single most time-sensitive moment in this app —
  // it deserves a distinct, attention-getting buzz, not just a silent screen swap.
  useEffect(() => {
    haptics.alert();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      respond('EXPIRED');
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const r = offer.reservation;
  const isManual = r?.transmission === 'MANUAL';

  return (
    <Modal animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>NEW JOB</Text>
          <Text style={styles.jobType}>{JOB_TYPE_LABEL[offer.jobType] ?? offer.jobType}</Text>
        </View>

        <View style={styles.countdownWrap}>
          <View style={styles.countdownRing}>
            <Text style={styles.countdownNumber}>{secondsLeft}</Text>
          </View>
          <Text style={styles.countdownLabel}>seconds to respond</Text>
        </View>

        <View style={styles.detailsCard}>
          {isManual && (
            <View style={styles.manualBanner}>
              <Text style={styles.manualBannerText}>⚠️ MANUAL TRANSMISSION</Text>
            </View>
          )}
          <DetailRow label="Customer" value={r?.customer?.fullName ?? '—'} />
          <DetailRow label="Vehicle" value={r ? `${r.vehicleColor} ${r.vehicleMake} ${r.vehicleModel}` : '—'} />
          <DetailRow label="Terminal" value={r?.terminal?.code ?? '—'} />
          <DetailRow label="Booking" value={r?.bookingCode ?? '—'} />
        </View>

        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <Button label="Decline" variant="secondary" size="large" disabled={responding} onPress={() => respond('DECLINED')} style={{ borderColor: COLORS.red }} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Accept" variant="primary" size="large" disabled={responding} onPress={() => respond('ACCEPTED')} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.gold,
  },
  jobType: {
    marginTop: 4,
    fontFamily: 'Jost_700Bold',
    fontSize: 20,
    color: COLORS.white,
  },
  countdownWrap: {
    alignItems: 'center',
    gap: 8,
  },
  countdownRing: {
    height: 132,
    width: 132,
    borderRadius: 66,
    borderWidth: 4,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontFamily: 'Jost_700Bold',
    fontSize: 48,
    color: COLORS.white,
  },
  countdownLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  detailsCard: {
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 16,
    gap: 10,
  },
  manualBanner: {
    borderRadius: RADII.card,
    backgroundColor: 'rgba(255,91,91,0.15)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  manualBannerText: {
    color: COLORS.red,
    fontWeight: '700',
    fontSize: 13,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});
