import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { OFF_SITE_ORIGINS, type OriginType } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, StepHeader } from '../../ui';
import type { ValetWizardData } from './types';

const OPTIONS: { type: OriginType; label: string; description: string }[] = [
  { type: 'LAX', label: 'LAX', description: 'Los Angeles International Airport — any terminal' },
  { type: 'JSX', label: 'JSX LAX', description: 'Private terminal near LAX' },
  { type: 'ATLANTIC_AVIATION', label: 'Atlantic Aviation', description: 'Private FBO near LAX' },
];

export function StepOrigin({
  data,
  update,
  onNext,
  onClose,
}: {
  data: ValetWizardData;
  update: (patch: Partial<ValetWizardData>) => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View>
      <StepHeader title="Where are you flying from?" step={0} totalSteps={7} onClose={onClose} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        We meet you wherever you depart.
      </Text>

      <View style={{ gap: 10 }}>
        {OPTIONS.map((opt) => {
          const offSite = OFF_SITE_ORIGINS.find((o) => o.type === opt.type);
          const active = data.originType === opt.type;
          return (
            <Pressable
              key={opt.type}
              onPress={() => update({ originType: opt.type })}
              style={{
                borderWidth: 1,
                borderRadius: theme.radii.card,
                padding: 16,
                borderColor: active ? theme.colors.text : theme.colors.border,
                backgroundColor: active ? theme.colors.inverseBackground : theme.colors.surface,
              }}
            >
              <Text style={{ fontFamily: theme.fonts.display, fontSize: 17, fontWeight: '700', color: active ? theme.colors.inverseText : theme.colors.text }}>
                {opt.label}
              </Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, marginTop: 2, color: active ? theme.colors.inverseText : theme.colors.textMuted, opacity: active ? 0.8 : 1 }}>
                {opt.description}
              </Text>
              {offSite && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: active ? theme.colors.inverseText : theme.colors.textMuted }}>
                    ⚠️ OFF-SITE
                  </Text>
                  <Text style={{ fontSize: 11, marginTop: 2, color: active ? theme.colors.inverseText : theme.colors.textMuted, opacity: active ? 0.8 : 1 }}>
                    {offSite.address}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 32 }}>
        <Button label="Continue" onPress={onNext} />
      </View>
    </View>
  );
}
