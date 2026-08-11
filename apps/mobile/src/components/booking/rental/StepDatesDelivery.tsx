import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { DeliveryMethod, PricingConfig } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, DateTimeField, Input, StepHeader } from '../../ui';
import type { RentalWizardData } from './types';

const METHODS: { value: DeliveryMethod; label: string; description: string }[] = [
  { value: 'LOT', label: 'Pick up at our lot', description: 'LAXValetCare Lot A, near LAX' },
  { value: 'LAX', label: 'Deliver to LAX', description: 'We bring it to your terminal' },
  { value: 'HOME', label: 'Deliver to an address', description: 'We bring it to you' },
];

export function StepDatesDelivery({
  data,
  update,
  pricing,
  onNext,
  onClose,
}: {
  data: RentalWizardData;
  update: (patch: Partial<RentalWizardData>) => void;
  pricing: PricingConfig | null;
  onNext: () => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const canContinue =
    !!data.pickupDate && !!data.returnDate && (data.deliveryMethod !== 'HOME' || !!data.deliveryAddress);

  return (
    <View>
      <StepHeader title="Dates & delivery" step={0} totalSteps={7} onClose={onClose} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        When do you need the car, and where should we bring it?
      </Text>

      <DateTimeField label="Pickup date & time" value={data.pickupDate} onChange={(d) => update({ pickupDate: d })} minimumDate={new Date()} />
      <DateTimeField
        label="Return date & time"
        value={data.returnDate}
        onChange={(d) => update({ returnDate: d })}
        minimumDate={data.pickupDate ?? new Date()}
      />

      <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 10 }}>
        Delivery method
      </Text>
      <View style={{ gap: 10 }}>
        {METHODS.map((m) => {
          const cents = pricing?.rental.deliveryCents[m.value] ?? 0;
          const active = data.deliveryMethod === m.value;
          return (
            <Pressable
              key={m.value}
              onPress={() => update({ deliveryMethod: m.value })}
              style={{
                padding: 14, borderRadius: theme.radii.card, borderWidth: active ? 1.5 : 1,
                borderColor: active ? theme.colors.text : theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: theme.colors.text }}>{m.label}</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>{m.description}</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '700', color: theme.colors.text, marginTop: 4 }}>
                {cents > 0 ? `${formatCents(cents)}` : 'Free'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {data.deliveryMethod === 'HOME' && (
        <View style={{ marginTop: 14 }}>
          <Input
            placeholder="Delivery address"
            value={data.deliveryAddress}
            onChangeText={(v) => update({ deliveryAddress: v })}
          />
        </View>
      )}

      <View style={{ marginTop: 12 }}>
        <Button label="Continue" onPress={onNext} disabled={!canContinue} />
      </View>
    </View>
  );
}
