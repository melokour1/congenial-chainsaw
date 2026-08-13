import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADII } from '../../lib/theme';

type BadgeVariant = 'default' | 'gold' | 'green' | 'blue' | 'red' | 'outline';

const VARIANT_STYLE: Record<BadgeVariant, { bg: string; fg: string; border?: string }> = {
  default: { bg: COLORS.surfaceAlt, fg: COLORS.white },
  gold: { bg: 'rgba(224,164,88,0.15)', fg: COLORS.gold },
  green: { bg: 'rgba(61,220,132,0.15)', fg: COLORS.green },
  blue: { bg: 'rgba(91,156,255,0.15)', fg: COLORS.blue },
  red: { bg: 'rgba(255,91,91,0.15)', fg: COLORS.red },
  outline: { bg: 'transparent', fg: COLORS.white, border: COLORS.border },
};

export function Badge({ label, variant = 'default' }: { label: string; variant?: BadgeVariant }) {
  const c = VARIANT_STYLE[variant];
  return (
    <View style={[styles.base, { backgroundColor: c.bg, borderColor: c.border ?? 'transparent', borderWidth: c.border ? 1 : 0 }]}>
      <Text style={[styles.label, { color: c.fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.pill,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
