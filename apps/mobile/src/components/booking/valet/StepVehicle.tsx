import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, Input, StepHeader } from '../../ui';
import type { ValetWizardData } from './types';

export function StepVehicle({
  data,
  update,
  onNext,
  onBack,
}: {
  data: ValetWizardData;
  update: (patch: Partial<ValetWizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const canContinue = !!data.color && !!data.make && !!data.model;

  return (
    <View>
      <StepHeader title="Your vehicle" step={2} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        So your valet can find it — and treat it right.
      </Text>

      <Input label="Color" value={data.color} onChangeText={(v) => update({ color: v })} placeholder="e.g. Silver" />
      <Input label="Make" value={data.make} onChangeText={(v) => update({ make: v })} placeholder="e.g. Toyota" />
      <Input label="Model" value={data.model} onChangeText={(v) => update({ model: v })} placeholder="e.g. Camry" />

      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text, fontFamily: theme.fonts.body, marginBottom: 8 }}>
        Transmission
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {(['AUTOMATIC', 'MANUAL'] as const).map((t) => {
          const active = data.transmission === t;
          return (
            <Pressable
              key={t}
              onPress={() => update({ transmission: t })}
              style={{
                flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center',
                borderRadius: theme.radii.card, borderWidth: 1,
                borderColor: active ? theme.colors.text : theme.colors.border,
                backgroundColor: active ? theme.colors.inverseBackground : theme.colors.surface,
              }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 14, color: active ? theme.colors.inverseText : theme.colors.text }}>
                {t === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => update({ skipPlate: !data.skipPlate, plate: '' })}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}
      >
        <View
          style={{
            width: 22, height: 22, borderRadius: 5, borderWidth: 1.5,
            borderColor: data.skipPlate ? theme.colors.text : theme.colors.border,
            backgroundColor: data.skipPlate ? theme.colors.text : 'transparent',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {data.skipPlate && <Text style={{ color: theme.colors.inverseText, fontSize: 14, fontWeight: '700' }}>✓</Text>}
        </View>
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14 }}>I'll add my plate later</Text>
      </Pressable>
      {!data.skipPlate && (
        <Input value={data.plate} onChangeText={(v) => update({ plate: v })} placeholder="License plate" />
      )}

      <View style={{ marginTop: 20 }}>
        <Button label="Continue" onPress={onNext} disabled={!canContinue} />
      </View>
    </View>
  );
}
