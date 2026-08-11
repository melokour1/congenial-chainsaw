import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, Input, StepHeader } from '../../ui';
import type { ValetWizardData } from './types';

const PRESETS = [1000, 2000, 3000];

export function StepGratuity({
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
  const isCustom = !PRESETS.includes(data.gratuityCents) && data.gratuityCents > 0;
  const isNone = data.gratuityCents === 0 && !isCustom;

  function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          minHeight: 48, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center',
          borderRadius: theme.radii.card, borderWidth: 1,
          borderColor: active ? theme.colors.text : theme.colors.border,
          backgroundColor: active ? theme.colors.inverseBackground : theme.colors.surface,
        }}
      >
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: active ? theme.colors.inverseText : theme.colors.text }}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View>
      <StepHeader title="Add a gratuity?" step={5} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        100% goes to your valet. Entirely optional.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {PRESETS.map((cents) => (
          <Chip key={cents} label={`$${cents / 100}`} active={data.gratuityCents === cents && !isCustom} onPress={() => update({ gratuityCents: cents, gratuityCustom: '' })} />
        ))}
        <Chip label="Custom" active={isCustom} onPress={() => update({ gratuityCents: isCustom ? data.gratuityCents : 0, gratuityCustom: data.gratuityCustom || '0' })} />
        <Chip label="No thanks" active={isNone} onPress={() => update({ gratuityCents: 0, gratuityCustom: '' })} />
      </View>

      {isCustom && (
        <View style={{ marginTop: 16 }}>
          <Input
            label="Custom amount (USD)"
            keyboardType="decimal-pad"
            value={data.gratuityCustom}
            onChangeText={(v) => update({ gratuityCustom: v, gratuityCents: Math.max(0, Math.round(Number(v) * 100)) || 0 })}
          />
        </View>
      )}

      <View style={{ marginTop: 12 }}>
        <Button label="Continue" onPress={onNext} />
      </View>
    </View>
  );
}
