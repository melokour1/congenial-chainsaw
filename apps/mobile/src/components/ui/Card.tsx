import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
  variant?: 'surface' | 'inverse';
}

export function Card({ children, onPress, style, padded = true, variant = 'surface' }: CardProps) {
  const { theme } = useTheme();
  const backgroundColor = variant === 'inverse' ? theme.colors.inverseBackground : theme.colors.surface;

  const content = (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderRadius: theme.radii.card,
          padding: padded ? theme.spacing(4) : 0,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
