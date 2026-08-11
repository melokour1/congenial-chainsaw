import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { TERMINALS } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { Button, DateTimeField, Input, StepHeader } from '../../ui';
import type { ValetWizardData } from './types';

export function StepTerminalFlight({
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
  const isLax = data.originType === 'LAX';
  const selectedTerminal = TERMINALS.find((t) => t.code === data.terminalCode);
  const effectiveDepartingAirline = data.airline === '__other__' ? data.airlineOther : data.airline;

  const canContinue = isLax
    ? !!data.terminalCode && !!effectiveDepartingAirline && !!data.departureDate && !!data.returnDateEstimate && !!data.departingFlightNumber
    : !!data.departureDate && !!data.returnDateEstimate && !!data.departingFlightNumber && !!data.departingAirline;

  function handleContinue() {
    if (isLax) update({ departingAirline: effectiveDepartingAirline });
    onNext();
  }

  return (
    <View>
      <StepHeader title="Terminal & flight details" step={1} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        {isLax ? 'Pick your terminal and airline so we know exactly where to meet you.' : 'Tell us your flight details.'}
      </Text>

      {isLax && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text, fontFamily: theme.fonts.body, marginBottom: 8 }}>
            Terminal
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TERMINALS.map((t) => {
              const active = data.terminalCode === t.code;
              return (
                <Pressable
                  key={t.code}
                  disabled={t.isClosed}
                  onPress={() => update({ terminalCode: t.code, airline: '', airlineOther: '' })}
                  style={{
                    minHeight: 44,
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                    borderRadius: theme.radii.card,
                    borderWidth: 1,
                    opacity: t.isClosed ? 0.4 : 1,
                    borderColor: active ? theme.colors.text : theme.colors.border,
                    backgroundColor: active ? theme.colors.inverseBackground : theme.colors.surface,
                  }}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '600', color: active ? theme.colors.inverseText : theme.colors.text }}>
                    Terminal {t.code}{t.isClosed ? ' (closed)' : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {selectedTerminal?.note && (
            <Text style={{ marginTop: 8, fontSize: 12, color: theme.colors.textMuted, fontFamily: theme.fonts.body }}>{selectedTerminal.note}</Text>
          )}

          {selectedTerminal && !selectedTerminal.isClosed && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text, fontFamily: theme.fonts.body, marginBottom: 8 }}>
                Airline
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[...selectedTerminal.airlines, '__other__'].map((airline) => {
                  const active = data.airline === airline;
                  return (
                    <Pressable
                      key={airline}
                      onPress={() => update({ airline })}
                      style={{
                        minHeight: 40,
                        paddingHorizontal: 12,
                        justifyContent: 'center',
                        borderRadius: theme.radii.card,
                        borderWidth: 1,
                        borderColor: active ? theme.colors.text : theme.colors.border,
                        backgroundColor: active ? theme.colors.inverseBackground : theme.colors.surface,
                      }}
                    >
                      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: active ? theme.colors.inverseText : theme.colors.text }}>
                        {airline === '__other__' ? 'Other' : airline}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {data.airline === '__other__' && (
                <View style={{ marginTop: 10 }}>
                  <Input placeholder="Airline name" value={data.airlineOther} onChangeText={(v) => update({ airlineOther: v })} />
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {!isLax && (
        <Input
          label="Airline"
          value={data.departingAirline}
          onChangeText={(v) => update({ departingAirline: v })}
          placeholder={data.originType === 'JSX' ? 'JSX' : 'Operator name'}
        />
      )}

      <DateTimeField label="Departure date & time" value={data.departureDate} onChange={(d) => update({ departureDate: d })} minimumDate={new Date()} />
      <DateTimeField label="Estimated return date & time" value={data.returnDateEstimate} onChange={(d) => update({ returnDateEstimate: d })} minimumDate={data.departureDate ?? new Date()} />
      <Input label="Departing flight number" value={data.departingFlightNumber} onChangeText={(v) => update({ departingFlightNumber: v })} placeholder="e.g. WN 452" />
      <Input label="Bags" value={data.bagsInfo} onChangeText={(v) => update({ bagsInfo: v })} placeholder="e.g. 2 checked, 1 carry-on" />

      <Pressable
        onPress={() => update({ skipReturnFlight: !data.skipReturnFlight, returningAirline: '', returningFlightNumber: '' })}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: data.skipReturnFlight ? 20 : 12 }}
      >
        <View
          style={{
            width: 22, height: 22, borderRadius: 5, borderWidth: 1.5,
            borderColor: data.skipReturnFlight ? theme.colors.text : theme.colors.border,
            backgroundColor: data.skipReturnFlight ? theme.colors.text : 'transparent',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {data.skipReturnFlight && <Text style={{ color: theme.colors.inverseText, fontSize: 14, fontWeight: '700' }}>✓</Text>}
        </View>
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 14 }}>I'll add my return flight later</Text>
      </Pressable>

      {!data.skipReturnFlight && (
        <>
          <Input label="Returning airline" value={data.returningAirline} onChangeText={(v) => update({ returningAirline: v })} />
          <Input label="Returning flight number" value={data.returningFlightNumber} onChangeText={(v) => update({ returningFlightNumber: v })} />
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button label="Continue" onPress={handleContinue} disabled={!canContinue} />
      </View>
    </View>
  );
}
