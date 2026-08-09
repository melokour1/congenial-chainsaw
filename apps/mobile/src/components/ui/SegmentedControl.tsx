import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeProvider';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { theme } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.surface, borderRadius: theme.radii.card }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              {
                backgroundColor: active ? theme.colors.text : 'transparent',
                borderRadius: theme.radii.card - 2,
              },
            ]}
          >
            <Text
              style={{
                color: active ? theme.colors.inverseText : theme.colors.textMuted,
                fontFamily: theme.fonts.body,
                fontWeight: '600',
                fontSize: 14,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
});
