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

/**
 * The brand wordmark, as its own fixed black-and-white lockup — deliberately not
 * theme-aware (unlike everything else in the UI kit) so it reads identically
 * whether it sits on a light nav bar or a dark screen. "Valet" breaks into an
 * italic serif to set it apart from "LAX"/"Care" in the regular display sans.
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
          paddingHorizontal: fontSize * 0.9,
          paddingVertical: fontSize * 0.5,
        },
        style,
      ]}
    >
      <Text style={{ includeFontPadding: false }}>
        <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#FFFFFF', fontSize, letterSpacing: -0.2 }}>LAX</Text>
        <Text style={{ fontFamily: 'PlayfairDisplay_700Bold_Italic', color: '#FFFFFF', fontSize: fontSize * 1.08 }}>Valet</Text>
        <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#FFFFFF', fontSize, letterSpacing: -0.2 }}>Care</Text>
      </Text>
    </View>
  );
}
