import React, { useState } from 'react';
import { Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/lib/ThemeProvider';
import { usePromoCodes } from '../../../src/hooks/usePromoCodes';
import { formatCents } from '../../../src/lib/format';
import { ScreenContainer, StepHeader, Card, Badge, EmptyState } from '../../../src/components/ui';

function discountLabel(pc: { discountType: string; discountValue: number }): string {
  if (pc.discountType === 'PERCENT') return `${pc.discountValue}% off`;
  if (pc.discountType === 'FIXED_CENTS') return `${formatCents(pc.discountValue)} off`;
  return 'Free service';
}

export default function PromoCodesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { promoCodes, loading } = usePromoCodes();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      <StepHeader title="Promo codes" onBack={() => router.back()} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        Active codes you can apply at checkout. Tap one to copy it.
      </Text>

      {!loading && promoCodes.length === 0 ? (
        <EmptyState icon="pricetag-outline" title="No active codes" body="Check back later for new offers." />
      ) : (
        <View style={{ gap: 10 }}>
          {promoCodes.map((pc) => (
            <Card
              key={pc.id}
              onPress={async () => {
                await Clipboard.setStringAsync(pc.code);
                setCopiedCode(pc.code);
                setTimeout(() => setCopiedCode((c) => (c === pc.code ? null : c)), 1500);
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700', color: theme.colors.text, letterSpacing: 1 }}>
                    {pc.code}
                  </Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.textMuted, marginTop: 4 }}>
                    {pc.description}
                  </Text>
                  {pc.expiresAt ? (
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>
                      Expires {new Date(pc.expiresAt).toLocaleDateString()}
                    </Text>
                  ) : null}
                </View>
                <Badge label={copiedCode === pc.code ? 'Copied ✓' : discountLabel(pc)} variant={copiedCode === pc.code ? 'success' : 'accent'} />
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
