import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../lib/ThemeProvider';

export function Divider({ spacing }: { spacing?: number }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.line,
        { backgroundColor: theme.colors.border, marginVertical: spacing ?? theme.spacing(3) },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth },
});
