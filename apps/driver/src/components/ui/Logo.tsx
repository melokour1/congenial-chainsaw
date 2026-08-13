import React from 'react';
import { Text, View, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const SIZES = { sm: 14, md: 18, lg: 30 };
const GOLD = '#E0A458';

/** Same lockup as apps/web and apps/mobile's brand wordmark — one geometric sans (Jost), "Valet" set apart by color alone. */
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
