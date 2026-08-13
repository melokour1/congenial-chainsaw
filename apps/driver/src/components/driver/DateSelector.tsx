import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, RADII } from '../../lib/theme';

const DAY_COUNT = 8; // today + next 7 days — future days are read-only, mirrors apps/web

function dateForOffset(offset: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

export function dateLabel(offset: number): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return dateForOffset(offset).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function isSameDayAsOffset(iso: string, offset: number): boolean {
  return new Date(iso).toDateString() === dateForOffset(offset).toDateString();
}

export function DateSelector({ selectedOffset, onSelect }: { selectedOffset: number; onSelect: (offset: number) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {Array.from({ length: DAY_COUNT }, (_, i) => i).map((offset) => {
        const selected = offset === selectedOffset;
        return (
          <TouchableOpacity key={offset} onPress={() => onSelect(offset)} style={[styles.pill, selected ? styles.pillSelected : styles.pillDefault]}>
            <Text style={[styles.label, { color: selected ? COLORS.black : COLORS.textMuted }]}>{dateLabel(offset)}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingRight: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADII.pill,
  },
  pillSelected: {
    backgroundColor: COLORS.white,
  },
  pillDefault: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
