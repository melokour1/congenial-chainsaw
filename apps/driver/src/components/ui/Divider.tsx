import React from 'react';
import { View } from 'react-native';
import { COLORS } from '../../lib/theme';

export function Divider({ spacing = 12 }: { spacing?: number }) {
  return <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: spacing }} />;
}
