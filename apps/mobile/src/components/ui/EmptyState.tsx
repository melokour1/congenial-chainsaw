import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/ThemeProvider';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'file-tray-outline', title, body, actionLabel, onAction }: EmptyStateProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={36} color={theme.colors.textMuted} />
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.display }]}>{title}</Text>
      {body ? (
        <Text style={[styles.body, { color: theme.colors.textMuted, fontFamily: theme.fonts.body }]}>{body}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: 16, width: '100%' }}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
