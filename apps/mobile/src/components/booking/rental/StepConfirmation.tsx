import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { PriceBreakdown } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, Card } from '../../ui';

export function StepConfirmation({
  bookingCode,
  breakdown,
  depositHoldCents,
}: {
  bookingCode: string;
  breakdown: PriceBreakdown | null;
  depositHoldCents: number;
}) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={{ alignItems: 'center', paddingTop: 24 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.text }}>
        <Text style={{ color: theme.colors.inverseText, fontSize: 28 }}>✓</Text>
      </View>
      <Text style={{ fontFamily: theme.fonts.display, fontSize: 24, fontWeight: '700', color: theme.colors.text, marginTop: 16 }}>
        Rental confirmed
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, color: theme.colors.textMuted, marginTop: 4 }}>Confirmation code</Text>
      <Text style={{ fontFamily: theme.fonts.display, fontSize: 20, fontWeight: '700', color: theme.colors.text, letterSpacing: 1 }}>
        {bookingCode}
      </Text>

      {breakdown && (
        <Card style={{ marginTop: 24, width: '100%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700', color: theme.colors.text }}>Total</Text>
            <Text style={{ fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
              {formatCents(breakdown.totalCents)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted }}>Security deposit hold</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted }}>{formatCents(depositHoldCents)}</Text>
          </View>
        </Card>
      )}

      <Card style={{ marginTop: 12, width: '100%' }}>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, fontWeight: '700', color: theme.colors.text }}>
          ⏳ Insurance — pending verification
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>
          We'll notify you once it's approved. Your vehicle isn't released until then.
        </Text>
      </Card>

      <View style={{ width: '100%', marginTop: 20 }}>
        <Button label="View in Activity" onPress={() => router.replace('/(tabs)/activity')} />
      </View>
    </View>
  );
}
