import React from 'react';
import { Text, View } from 'react-native';
import type { PricingConfig, ServiceTier } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, Card, Input, StepHeader } from '../../ui';
import type { ValetWizardData } from './types';

const TIERS: { tier: ServiceTier; title: string; description: string }[] = [
  { tier: 'STANDARD', title: 'Standard', description: 'Indoor storage, real-time tracking, curbside handoff.' },
  { tier: 'VIP_EXPRESS', title: 'VIP Express', description: 'Priority pickup and delivery — first in line, every time.' },
  { tier: 'VIP_ELITE', title: 'VIP Elite', description: 'White-glove service: dedicated valet, priority everything.' },
];

export function StepServiceTier({
  data,
  update,
  pricing,
  onNext,
  onBack,
}: {
  data: ValetWizardData;
  update: (patch: Partial<ValetWizardData>) => void;
  pricing: PricingConfig;
  onNext: () => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();

  function tierPriceLabel(tier: ServiceTier): string {
    if (tier === 'STANDARD') return `${formatCents(pricing.valet.standardPerDayCents)}/day`;
    if (tier === 'VIP_EXPRESS') return `+${formatCents(pricing.valet.vipExpressPerPersonCents)}/person`;
    return `+${formatCents(pricing.valet.vipElitePerPersonCents)}/person`;
  }

  const isVip = data.serviceTier !== 'STANDARD';

  return (
    <View>
      <StepHeader title="Choose your service tier" step={3} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        Standard valet is included with every booking.
      </Text>

      <View style={{ gap: 10 }}>
        {TIERS.map((t) => {
          const active = data.serviceTier === t.tier;
          return (
            <Card key={t.tier} onPress={() => update({ serviceTier: t.tier })} style={{ borderColor: active ? theme.colors.text : theme.colors.border, borderWidth: active ? 1.5 : 1 }}>
              <Text style={{ fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700', color: theme.colors.text }}>{t.title}</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600', color: theme.colors.text, marginTop: 2 }}>{tierPriceLabel(t.tier)}</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 4 }}>{t.description}</Text>
            </Card>
          );
        })}
      </View>

      {isVip && (
        <View style={{ marginTop: 16 }}>
          <Input
            label="Number of people"
            keyboardType="number-pad"
            value={String(data.vipPersonCount)}
            onChangeText={(v) => update({ vipPersonCount: Math.max(1, Number(v) || 1) })}
          />
        </View>
      )}

      <View style={{ marginTop: 12 }}>
        <Button label="Continue" onPress={onNext} />
      </View>
    </View>
  );
}
