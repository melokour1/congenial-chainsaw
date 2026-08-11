import React from 'react';
import { Text, View } from 'react-native';
import type { AddOnType, PricingConfig } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, Card, StepHeader } from '../../ui';
import type { ValetWizardData } from './types';

const ADD_ONS: { type: AddOnType; title: string; description: string }[] = [
  { type: 'HAND_WASH', title: 'Hand Wash', description: 'Exterior hand wash while your car is stored.' },
  { type: 'FULL_DETAIL', title: 'Full Detail', description: 'Interior + exterior detail, done curbside-ready.' },
  { type: 'EV_CHARGE', title: 'EV Charge', description: 'Topped off and ready for your next trip.' },
  { type: 'GAS_FILL_UP', title: 'Gas Fill-Up', description: 'Full tank, billed at pump price plus service fee.' },
];

export function StepAddOns({
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

  function priceLabel(type: AddOnType): string {
    if (type === 'HAND_WASH') return formatCents(pricing.carCare.handWashCents);
    if (type === 'FULL_DETAIL') return formatCents(pricing.carCare.fullDetailCents);
    if (type === 'EV_CHARGE') return formatCents(pricing.carCare.evChargeCents);
    return pricing.carCare.gasFillUpCents != null ? formatCents(pricing.carCare.gasFillUpCents) : 'Ask your valet — not bookable here yet';
  }

  // Gas fill-up has no fixed price (billed at pump price), so it can't be quoted
  // or added to the total — selecting it would silently add a $0 line item.
  function isDisabled(type: AddOnType): boolean {
    return type === 'GAS_FILL_UP' && pricing.carCare.gasFillUpCents == null;
  }

  function toggle(type: AddOnType) {
    if (isDisabled(type)) return;
    update({ addOns: data.addOns.includes(type) ? data.addOns.filter((a) => a !== type) : [...data.addOns, type] });
  }

  return (
    <View>
      <StepHeader title="Car care add-ons" step={4} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        Optional — skip this step if you don't need any.
      </Text>

      <View style={{ gap: 10 }}>
        {ADD_ONS.map((a) => {
          const active = data.addOns.includes(a.type);
          const disabled = isDisabled(a.type);
          return (
            <Card
              key={a.type}
              onPress={disabled ? undefined : () => toggle(a.type)}
              style={{
                borderColor: active ? theme.colors.text : theme.colors.border,
                borderWidth: active ? 1.5 : 1,
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: theme.fonts.display, fontSize: 15, fontWeight: '700', color: theme.colors.text }}>{a.title}</Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>{a.description}</Text>
                </View>
                <View
                  style={{
                    width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center',
                    borderColor: active ? theme.colors.text : theme.colors.border,
                    backgroundColor: active ? theme.colors.text : 'transparent',
                  }}
                >
                  {active && <Text style={{ color: theme.colors.inverseText, fontSize: 12, fontWeight: '700' }}>✓</Text>}
                </View>
              </View>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600', color: theme.colors.text, marginTop: 10 }}>{priceLabel(a.type)}</Text>
            </Card>
          );
        })}
      </View>

      <View style={{ marginTop: 20 }}>
        <Button label="Continue" onPress={onNext} />
      </View>
    </View>
  );
}
