import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { COLORS, MIN_TOUCH_TARGET, RADII } from '../../lib/theme';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'default' | 'large';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

/** Big, unmissable single-thumb-reachable buttons — every primary action in this app gets one. */
export function Button({ label, onPress, variant = 'primary', size = 'default', disabled, loading, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  const backgroundColor = variant === 'primary' ? COLORS.white : variant === 'danger' ? COLORS.red : 'transparent';
  const borderColor = variant === 'secondary' ? COLORS.border : backgroundColor;
  const textColor = variant === 'secondary' ? COLORS.white : COLORS.black;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          minHeight: size === 'large' ? 64 : MIN_TOUCH_TARGET,
          opacity: isDisabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor, fontSize: size === 'large' ? 17 : 15 }]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: RADII.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: 'Jost_700Bold',
    letterSpacing: 0.3,
  },
});
