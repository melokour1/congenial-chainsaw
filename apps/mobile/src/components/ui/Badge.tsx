import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeProvider';

type BadgeVariant = 'default' | 'accent' | 'success' | 'danger' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { theme } = useTheme();

  const config: Record<BadgeVariant, { bg: string; fg: string; border?: string }> = {
    default: { bg: theme.colors.surfaceAlt, fg: theme.colors.text },
    accent: { bg: theme.colors.accent, fg: '#1A1300' },
    success: { bg: theme.colors.success, fg: theme.colors.inverseText },
    danger: { bg: theme.colors.danger, fg: theme.colors.inverseText },
    outline: { bg: 'transparent', fg: theme.colors.text, border: theme.colors.border },
  };
  const c = config[variant];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: c.bg, borderColor: c.border ?? 'transparent', borderWidth: c.border ? 1 : 0 },
      ]}
    >
      <Text style={[styles.label, { color: c.fg, fontFamily: theme.fonts.body }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
