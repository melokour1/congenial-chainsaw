import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../lib/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

export function Input({ label, error, style, ...rest }: InputProps) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing(4) }}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            borderColor: error ? theme.colors.danger : theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.card,
            fontFamily: theme.fonts.body,
            minHeight: theme.minTouchTarget,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
