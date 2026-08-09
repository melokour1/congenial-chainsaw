import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/ThemeProvider';

interface StepHeaderProps {
  title: string;
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  onClose?: () => void;
}

/** Shared in-screen header for the valet/rental booking flows — custom, not native, so it matches the black & white design exactly. */
export function StepHeader({ title, step, totalSteps, onBack, onClose }: StepHeaderProps) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={{ marginBottom: theme.spacing(5) }}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack ?? (() => router.back())}
          hitSlop={12}
          style={[styles.iconBtn, { minWidth: theme.minTouchTarget, minHeight: theme.minTouchTarget }]}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        {step !== undefined && totalSteps !== undefined ? (
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13 }}>
            Step {step + 1} of {totalSteps}
          </Text>
        ) : (
          <View />
        )}
        {onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            hitSlop={12}
            style={[styles.iconBtn, { minWidth: theme.minTouchTarget, minHeight: theme.minTouchTarget }]}
          >
            <Ionicons name="close" size={22} color={theme.colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: theme.minTouchTarget }} />
        )}
      </View>
      {step !== undefined && totalSteps !== undefined ? (
        <View style={[styles.track, { backgroundColor: theme.colors.surfaceAlt }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: theme.colors.text, width: `${((step + 1) / totalSteps) * 100}%` },
            ]}
          />
        </View>
      ) : null}
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.display }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 16,
  },
});
