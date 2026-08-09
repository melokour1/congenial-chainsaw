import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/ThemeProvider';

interface PlaceholderImageProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  style?: ViewStyle;
  radius?: number;
}

/**
 * Styled placeholder for photography that doesn't exist in this scaffold
 * (vehicle photos, DL scans, etc). Dark background + subtle border per the
 * design spec — never a broken <Image>.
 */
export function PlaceholderImage({ icon = 'car-sport-outline', label, style, radius }: PlaceholderImageProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.mode === 'dark' ? '#141414' : theme.colors.surfaceAlt,
          borderColor: theme.colors.border,
          borderRadius: radius ?? theme.radii.card,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={28} color={theme.colors.textMuted} />
      {label ? (
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 12, marginTop: 6 }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
