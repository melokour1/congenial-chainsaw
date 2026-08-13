import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { formatCents } from '@laxvaletcare/shared';
import { api } from '../../../src/lib/api';
import { useDriver } from '../../../src/lib/DriverProvider';
import { useJobs } from '../../../src/lib/JobsProvider';
import { isSameDayAsOffset } from '../../../src/components/driver/DateSelector';
import { COLORS, RADII } from '../../../src/lib/theme';
import type { Assignment, ValetStats } from '../../../src/lib/types';
import { Card } from '../../../src/components/ui/Card';
import { ConfirmDialog } from '../../../src/components/ui/ConfirmDialog';
import { JobListItem } from '../../../src/components/driver/JobListItem';
import { EmptyState } from '../../../src/components/ui/EmptyState';

function hoursOnline(clockedInAt: string | null): string {
  if (!clockedInAt) return '0.0';
  const ms = Date.now() - new Date(clockedInAt).getTime();
  return Math.max(0, ms / 3_600_000).toFixed(1);
}

export default function Home() {
  const { profile, setStatus, clockOut } = useDriver();
  const { jobs, refetch } = useJobs();
  const [stats, setStats] = useState<ValetStats | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmClockOut, setConfirmClockOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = () => api.get<ValetStats>('/api/valet/stats').then(setStats).catch(() => {});

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), refetch()]);
    setRefreshing(false);
  };

  const onBreakToggle = async () => {
    setBusy(true);
    try {
      await setStatus(profile.valetStatus === 'BREAK' ? 'AVAILABLE' : 'BREAK');
    } finally {
      setBusy(false);
    }
  };

  const todayAssignments: Assignment[] = [];
  for (const job of jobs) {
    if (job.departureValetId === profile.id && isSameDayAsOffset(job.departureDate, 0)) {
      todayAssignments.push({ type: 'DEPARTURE', reservation: job });
    }
    if (job.returnValetId === profile.id && isSameDayAsOffset(job.returnDateEstimate, 0)) {
      todayAssignments.push({ type: 'RETURN', reservation: job });
    }
  }
  const upNext = todayAssignments
    .slice()
    .sort((a, b) => {
      const ta = new Date(a.type === 'DEPARTURE' ? a.reservation.departureDate : a.reservation.returnDateEstimate).getTime();
      const tb = new Date(b.type === 'DEPARTURE' ? b.reservation.departureDate : b.reservation.returnDateEstimate).getTime();
      return ta - tb;
    })
    .slice(0, 3);

  const isOnBreak = profile.valetStatus === 'BREAK';
  const isBusy = profile.valetStatus === 'BUSY';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl tintColor={COLORS.white} refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Hey, {profile.fullName.split(' ')[0]}</Text>

      {/* Big Uber-style online status control — tapping it is how you go offline (clock out). */}
      <TouchableOpacity
        style={[styles.statusCard, { borderColor: isBusy ? COLORS.gold : isOnBreak ? COLORS.blue : COLORS.green }]}
        onPress={() => setConfirmClockOut(true)}
        activeOpacity={0.85}
      >
        <View style={[styles.statusDot, { backgroundColor: isBusy ? COLORS.gold : isOnBreak ? COLORS.blue : COLORS.green }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statusLabel}>{isBusy ? 'ON A JOB' : isOnBreak ? 'ON BREAK' : 'ONLINE'}</Text>
          <Text style={styles.statusSub}>
            {profile.queuePosition != null ? `#${profile.queuePosition} in queue · ` : ''}Tap to clock out
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.breakButton, isOnBreak && styles.breakButtonActive]}
        onPress={onBreakToggle}
        disabled={busy || isBusy}
      >
        <Text style={[styles.breakLabel, isOnBreak && { color: COLORS.black }]}>
          {isOnBreak ? 'Back to available' : 'Take a break'}
        </Text>
      </TouchableOpacity>

      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Today</Text>
        <View style={styles.statsRow}>
          <Stat value={stats ? String(stats.today.jobsCompleted) : '—'} label="Jobs done" />
          <Stat value={hoursOnline(profile.clockedInAt)} label="Hours online" />
          <Stat value={stats ? formatCents(stats.today.tipsTotalCents) : '—'} label="Tips" />
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Up next</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/jobs')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {upNext.length === 0 ? (
        <EmptyState title="Nothing on deck" subtitle="New jobs will alert you the moment they come in." />
      ) : (
        <View style={{ gap: 10 }}>
          {upNext.map((a) => (
            <JobListItem
              key={`${a.type}-${a.reservation.id}`}
              assignment={a}
              onPress={() => router.push(`/(app)/job/${a.reservation.id}?type=${a.type}`)}
            />
          ))}
        </View>
      )}

      {confirmClockOut && (
        <ConfirmDialog
          title="Clock out?"
          message="You'll be signed out and removed from the queue. Any active jobs should be completed first."
          confirmLabel="Yes, clock out"
          danger
          onConfirm={clockOut}
          onCancel={() => setConfirmClockOut(false)}
        />
      )}
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  greeting: {
    fontFamily: 'Jost_700Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADII.card,
    borderWidth: 2,
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  statusLabel: {
    fontFamily: 'Jost_700Bold',
    fontSize: 18,
    letterSpacing: 0.5,
    color: COLORS.white,
  },
  statusSub: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  breakButton: {
    height: 44,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakButtonActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  breakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  statsCard: {
    marginTop: 4,
  },
  statsTitle: {
    fontFamily: 'Jost_700Bold',
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statValue: {
    fontFamily: 'Jost_700Bold',
    fontSize: 20,
    color: COLORS.white,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  sectionHeader: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Jost_700Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.gold,
  },
});
