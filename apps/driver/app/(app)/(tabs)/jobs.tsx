import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { assignmentNeedsAction } from '../../../src/lib/actionCopy';
import { useDriver } from '../../../src/lib/DriverProvider';
import { useJobs } from '../../../src/lib/JobsProvider';
import { DateSelector, isSameDayAsOffset } from '../../../src/components/driver/DateSelector';
import { JobListItem } from '../../../src/components/driver/JobListItem';
import { COLORS, RADII } from '../../../src/lib/theme';
import type { Assignment } from '../../../src/lib/types';
import { EmptyState } from '../../../src/components/ui/EmptyState';

type FilterKey = 'ALL' | 'DEPARTURES' | 'RETURNS' | 'NEEDS_ACTION';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'DEPARTURES', label: 'Departures' },
  { key: 'RETURNS', label: 'Returns' },
  { key: 'NEEDS_ACTION', label: 'Needs Action' },
];

export default function Jobs() {
  const { profile } = useDriver();
  const { jobs, loaded, refetch } = useJobs();
  const [dayOffset, setDayOffset] = useState(0);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const assignments: Assignment[] = useMemo(() => {
    const out: Assignment[] = [];
    for (const job of jobs) {
      if (job.departureValetId === profile.id && isSameDayAsOffset(job.departureDate, dayOffset)) {
        out.push({ type: 'DEPARTURE', reservation: job });
      }
      if (job.returnValetId === profile.id && isSameDayAsOffset(job.returnDateEstimate, dayOffset)) {
        out.push({ type: 'RETURN', reservation: job });
      }
    }
    return out;
  }, [jobs, dayOffset, profile.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter((a) => {
      if (filter === 'DEPARTURES' && a.type !== 'DEPARTURE') return false;
      if (filter === 'RETURNS' && a.type !== 'RETURN') return false;
      if (filter === 'NEEDS_ACTION' && !assignmentNeedsAction(a.type, a.reservation.activityLogs)) return false;
      if (!q) return true;
      const r = a.reservation;
      return (
        r.customer.fullName.toLowerCase().includes(q) ||
        (r.plate ?? '').toLowerCase().includes(q) ||
        r.bookingCode.toLowerCase().includes(q) ||
        (r.customer.phone ?? '').toLowerCase().includes(q)
      );
    });
  }, [assignments, filter, search]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Jobs</Text>

      <View style={styles.dateWrap}>
        <DateSelector selectedOffset={dayOffset} onSelect={setDayOffset} />
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search name, plate, booking, phone…"
        placeholderTextColor={COLORS.textMuted}
        style={styles.search}
      />

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterPill, active ? styles.filterPillActive : styles.filterPillDefault]}>
              <Text style={[styles.filterLabel, { color: active ? COLORS.black : COLORS.textMuted }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(a) => `${a.type}-${a.reservation.id}`}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl tintColor={COLORS.white} refreshing={refreshing} onRefresh={onRefresh} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <JobListItem assignment={item} onPress={() => router.push(`/(app)/job/${item.reservation.id}?type=${item.type}`)} />
        )}
        ListEmptyComponent={
          loaded ? (
            <EmptyState
              title={assignments.length === 0 ? 'No jobs for this day' : 'No matches'}
              subtitle={assignments.length === 0 ? undefined : 'Try a different search or filter.'}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 8,
    fontFamily: 'Jost_700Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  dateWrap: {
    marginTop: 12,
  },
  search: {
    marginTop: 12,
    height: 46,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    color: COLORS.white,
    fontSize: 14,
  },
  filterRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.pill,
  },
  filterPillActive: {
    backgroundColor: COLORS.white,
  },
  filterPillDefault: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    marginTop: 14,
    paddingBottom: 24,
  },
});
