import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/ThemeProvider';
import { Badge } from '../ui';

interface AccountRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  badge?: string;
  onPress: () => void;
  destructive?: boolean;
}

export function AccountRow({ icon, label, sublabel, badge, onPress, destructive }: AccountRowProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { borderBottomColor: theme.colors.border, minHeight: theme.minTouchTarget }]}
    >
      <Ionicons name={icon} size={20} color={destructive ? theme.colors.danger : theme.colors.text} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              color: destructive ? theme.colors.danger : theme.colors.text,
              fontFamily: theme.fonts.body,
              fontSize: 16,
              fontWeight: '500',
            }}
          >
            {label}
          </Text>
          {badge ? <Badge label={badge} variant="accent" /> : null}
        </View>
        {sublabel ? (
          <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 2 }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {!destructive ? <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
