import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const SIZES = {
  sm: 14,
  md: 18,
  lg: 30,
};

const GOLD = '#E0A458';

/**
 * The brand wordmark, as its own fixed black-and-white(-and-gold) lockup —
 * deliberately not theme-aware (unlike everything else in the UI kit) so it
 * reads identically whether it sits on a light nav bar or a dark screen.
 * One continuous word, one geometric sans throughout (Jost) — "Valet" is set
 * apart from "LAX"/"Care" by color alone, not a font or weight change.
 */
export function Logo({ size = 'md', style }: LogoProps) {
  const fontSize = SIZES[size];

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: '#000000',
          borderRadius: 12,
          paddingHorizontal: fontSize * 1.6,
          paddingVertical: fontSize * 0.85,
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text style={{ includeFontPadding: false }}>
        <Text style={{ fontFamily: 'Jost_700Bold', color: '#FFFFFF', fontSize }}>LAX</Text>
        <Text style={{ fontFamily: 'Jost_700Bold', color: GOLD, fontSize }}>Valet</Text>
        <Text style={{ fontFamily: 'Jost_700Bold', color: '#FFFFFF', fontSize }}>Care</Text>
      </Text>
    </View>
  );
}
