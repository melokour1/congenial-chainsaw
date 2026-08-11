import React from 'react';
import { Text, View } from 'react-native';
import type { RentalClass } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { useFleetVehicles } from '../../../hooks/useFleetVehicles';
import { Button, Card, PlaceholderImage, StepHeader } from '../../ui';
import type { RentalWizardData } from './types';

const CLASS_ORDER: RentalClass[] = ['ECONOMY', 'STANDARD', 'SUV', 'PREMIUM', 'LUXURY', 'VAN'];
const CLASS_LABEL: Record<RentalClass, string> = {
  ECONOMY: 'Economy',
  STANDARD: 'Standard',
  SUV: 'SUV',
  PREMIUM: 'Premium',
  LUXURY: 'Luxury',
  VAN: 'Van',
};

export function StepBrowseFleet({
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
  const { byClass, loading } = useFleetVehicles();

  const groups = CLASS_ORDER.map((cls) => ({ cls, vehicles: byClass[cls] ?? [] })).filter((g) => g.vehicles.length > 0);

  return (
    <View>
      <StepHeader title="Choose a vehicle" step={1} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        Our current fleet, grouped by class.
      </Text>

      {loading ? null : groups.length === 0 ? (
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14 }}>
          No vehicles are available right now — please check back soon.
        </Text>
      ) : (
        <View style={{ gap: 20 }}>
          {groups.map((group) => (
            <View key={group.cls}>
              <Text style={{ fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 10 }}>
                {CLASS_LABEL[group.cls]}
              </Text>
              <View style={{ gap: 10 }}>
                {group.vehicles.map((v) => {
                  const active = data.fleetVehicleId === v.id;
                  return (
                    <Card key={v.id} onPress={() => update({ fleetVehicleId: v.id })} style={{ borderColor: active ? theme.colors.text : theme.colors.border, borderWidth: active ? 1.5 : 1 }}>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <PlaceholderImage style={{ width: 96, height: 72 }} label={undefined} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: theme.fonts.display, fontSize: 15, fontWeight: '700', color: theme.colors.text }}>
                            {v.make} {v.model}
                          </Text>
                          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>
                            {v.year} · {v.color} · {v.mileage.toLocaleString()} mi
                          </Text>
                          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: theme.colors.text, marginTop: 6 }}>
                            {formatCents(v.dailyRateCents)}/day
                          </Text>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Button label="Continue" onPress={onNext} disabled={!data.fleetVehicleId} />
      </View>
    </View>
  );
}
