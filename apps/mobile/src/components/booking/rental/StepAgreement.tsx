import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../../lib/ThemeProvider';
import { formatDate } from '../../../lib/format';
import { Button, Card, SignaturePad, StepHeader } from '../../ui';
import type { FleetVehicle } from '../../../lib/types';
import type { RentalWizardData } from './types';

export function StepAgreement({
  data,
  update,
  vehicle,
  bookingCode,
  bookingId,
  onNext,
  onBack,
}: {
  data: RentalWizardData;
  update: (patch: Partial<RentalWizardData>) => void;
  vehicle: FleetVehicle | null;
  bookingCode: string | null;
  bookingId: string | null;
  onNext: () => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const canContinue = data.agreementChecked && !!data.signatureUrl;

  return (
    <View>
      <StepHeader title="Rental agreement" step={3} totalSteps={7} onBack={onBack} />
      <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 20 }}>
        Please review the terms below and sign to continue.
      </Text>

      <Card style={{ maxHeight: 260 }}>
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
          <Text style={{ fontFamily: theme.fonts.display, fontSize: 15, fontWeight: '700', color: theme.colors.text }}>
            LAXValetCare Vehicle Rental Agreement
          </Text>
          <AgreementParagraph theme={theme}>
            This Rental Agreement ("Agreement") is entered into between LAXValetCare ("Company") and the renter
            identified on booking {bookingCode ?? '—'} ("Renter") for the vehicle
            {vehicle ? ` ${vehicle.year} ${vehicle.make} ${vehicle.model}` : ''}, pickup{' '}
            {data.pickupDate ? formatDate(data.pickupDate) : '—'}, return {data.returnDate ? formatDate(data.returnDate) : '—'}.
          </AgreementParagraph>
          <AgreementParagraph theme={theme} bold="1. Condition & Use.">
            Renter accepts the vehicle in its condition as documented at pickup and agrees to return it in the same
            condition, ordinary wear excepted. The vehicle may only be operated by the Renter and any approved
            additional drivers listed on this booking, and only for lawful purposes within the continental United
            States unless otherwise agreed in writing.
          </AgreementParagraph>
          <AgreementParagraph theme={theme} bold="2. Insurance.">
            Renter must maintain valid insurance coverage for the duration of the rental, either through their own
            policy or a LAXValetCare protection plan. Coverage is subject to review and approval by LAXValetCare
            before pickup; no rental is released without approved insurance on file.
          </AgreementParagraph>
          <AgreementParagraph theme={theme} bold="3. Fuel & Mileage.">
            The vehicle should be returned with the same fuel level as at pickup. Excess mileage, smoking, and
            unreasonable wear may incur additional charges disclosed in the LAXValetCare pricing schedule.
          </AgreementParagraph>
          <AgreementParagraph theme={theme} bold="4. Late Returns.">
            Vehicles not returned by the scheduled return time are subject to hourly and daily late fees, and may be
            reported after 72 hours per LAXValetCare's overdue vehicle policy.
          </AgreementParagraph>
          <AgreementParagraph theme={theme} bold="5. Liability.">
            Renter is responsible for any damage, loss, or theft occurring during the rental period not covered by
            approved insurance, up to the vehicle's fair market value, subject to the security deposit held at
            pickup.
          </AgreementParagraph>
          <AgreementParagraph theme={theme} bold="6. Signature.">
            By checking the box and signing below, Renter acknowledges having read, understood, and agreed to the
            full terms of this Agreement.
          </AgreementParagraph>
        </ScrollView>
      </Card>

      <Pressable
        onPress={() => update({ agreementChecked: !data.agreementChecked })}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 16 }}
      >
        <View
          style={{
            width: 22, height: 22, borderRadius: 5, marginTop: 1, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: data.agreementChecked ? theme.colors.text : theme.colors.border,
            backgroundColor: data.agreementChecked ? theme.colors.inverseBackground : 'transparent',
          }}
        >
          {data.agreementChecked ? <Text style={{ color: theme.colors.inverseText, fontSize: 12, fontWeight: '700' }}>✓</Text> : null}
        </View>
        <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.text }}>
          I have read and agree to the LAXValetCare Vehicle Rental Agreement.
        </Text>
      </Pressable>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 8 }}>
          Sign below
        </Text>
        <SignaturePad rentalBookingId={bookingId ?? undefined} onSigned={(url) => update({ signatureUrl: url })} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button label="Continue" onPress={onNext} disabled={!canContinue} />
      </View>
    </View>
  );
}

function AgreementParagraph({ theme, bold, children }: { theme: ReturnType<typeof useTheme>['theme']; bold?: string; children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, lineHeight: 18, color: theme.colors.textMuted, marginTop: 8 }}>
      {bold ? <Text style={{ fontWeight: '700', color: theme.colors.text }}>{bold} </Text> : null}
      {children}
    </Text>
  );
}
