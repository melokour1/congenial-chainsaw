import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, Card, StepHeader } from '../../ui';
import { EXTRA_DRIVER_CENTS_PER_DAY, CHILD_SEAT_CENTS_PER_DAY, type RentalWizardData } from './types';

export function StepAddOns({
  data,
  update,
  onNext,
  onBack,
}: {
  data: RentalWizardData;
  update: (patch: Partial<RentalWizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View>
      <StepHeader title="Add-ons" step={4} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        Optional extras for your rental.
      </Text>

      <View style={{ gap: 10 }}>
        <Card onPress={() => update({ extraDriver: !data.extraDriver })} style={{ borderColor: data.extraDriver ? theme.colors.text : theme.colors.border, borderWidth: data.extraDriver ? 1.5 : 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.display, fontSize: 15, fontWeight: '700', color: theme.colors.text }}>Extra driver</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>
                Add a second approved driver to this rental.
              </Text>
            </View>
            <CheckDot active={data.extraDriver} theme={theme} />
          </View>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: theme.colors.text, marginTop: 10 }}>
            ${EXTRA_DRIVER_CENTS_PER_DAY / 100}/day
          </Text>
        </Card>

        <Card onPress={() => update({ childSeat: !data.childSeat })} style={{ borderColor: data.childSeat ? theme.colors.text : theme.colors.border, borderWidth: data.childSeat ? 1.5 : 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: theme.fonts.display, fontSize: 15, fontWeight: '700', color: theme.colors.text }}>Child seat</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>
                A properly installed child seat, ready at pickup.
              </Text>
            </View>
            <CheckDot active={data.childSeat} theme={theme} />
          </View>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: theme.colors.text, marginTop: 10 }}>
            ${CHILD_SEAT_CENTS_PER_DAY / 100}/day
          </Text>
        </Card>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button label="Continue" onPress={onNext} />
      </View>
    </View>
  );
}

function CheckDot({ active, theme }: { active: boolean; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View
      style={{
        width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: active ? theme.colors.text : theme.colors.border,
        backgroundColor: active ? theme.colors.inverseBackground : 'transparent',
      }}
    >
      {active ? <Text style={{ color: theme.colors.inverseText, fontSize: 12, fontWeight: '700' }}>✓</Text> : null}
    </View>
  );
}
