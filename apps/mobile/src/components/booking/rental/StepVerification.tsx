import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { PricingConfig } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { useTheme } from '../../../lib/ThemeProvider';
import { api, ApiError } from '../../../lib/api';
import { Button, Card, DateTimeField, Input, PhotoPickerTile, StepHeader } from '../../ui';
import type { RentalWizardData } from './types';

type Stage = 'creating' | 'identity' | 'insurance' | 'done';

export function StepVerification({
  data,
  update,
  pricing,
  bookingId,
  bookingCode,
  needsVerification,
  onBookingCreated,
  onNext,
  onBack,
}: {
  data: RentalWizardData;
  update: (patch: Partial<RentalWizardData>) => void;
  pricing: PricingConfig | null;
  bookingId: string | null;
  bookingCode: string | null;
  needsVerification: boolean | null;
  onBookingCreated: (result: { id: string; bookingCode: string; needsVerification: boolean }) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const [stage, setStage] = useState<Stage>(bookingId ? (needsVerification ? 'identity' : 'insurance') : 'creating');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function createBooking() {
    setError(null);
    try {
      if (!data.pickupDate || !data.returnDate) throw new Error('Missing pickup/return dates.');
      const json = await api.post<{ id: string; bookingCode: string; needsVerification: boolean }>('/api/rentals', {
        fleetVehicleId: data.fleetVehicleId,
        pickupDate: data.pickupDate.toISOString(),
        returnDate: data.returnDate.toISOString(),
        deliveryMethod: data.deliveryMethod,
        deliveryAddress: data.deliveryMethod === 'HOME' ? data.deliveryAddress : undefined,
      });
      onBookingCreated(json);
      setStage(json.needsVerification ? 'identity' : 'insurance');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not start rental');
    }
  }

  useEffect(() => {
    if (stage === 'creating' && !bookingId) createBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  async function submitIdentity() {
    if (!bookingId) return;
    setSaving(true);
    setError(null);
    try {
      if (!data.dlExpiry || !data.dob) throw new Error('Please provide a valid licence expiry and date of birth.');
      if (!data.dlFrontUrl || !data.dlBackUrl) throw new Error('Please upload photos of both sides of your licence.');

      await api.post(`/api/rentals/${bookingId}/verification`, {
        dlNumber: data.dlNumber,
        dlState: data.dlState,
        dlExpiry: data.dlExpiry.toISOString(),
        dob: data.dob.toISOString(),
        fullLegalName: data.fullLegalName,
        addressStreet: data.addressStreet,
        addressUnit: data.addressUnit || undefined,
        addressCity: data.addressCity,
        addressState: data.addressState,
        addressZip: data.addressZip,
        phone: data.phone,
        email: data.email,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelationship: data.emergencyContactRelationship,
        dlFrontUrl: data.dlFrontUrl,
        dlBackUrl: data.dlBackUrl,
      });
      setStage('insurance');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setSaving(false);
    }
  }

  async function submitInsurance() {
    if (!bookingId) return;
    setSaving(true);
    setError(null);
    try {
      const body =
        data.insuranceOption === 'OWN'
          ? {
              option: 'OWN',
              insuranceCompany: data.insuranceCompany,
              insurancePolicyNumber: data.insurancePolicyNumber,
              insuranceCardFrontUrl: data.insuranceCardFrontUrl || undefined,
              insuranceCardBackUrl: data.insuranceCardBackUrl || undefined,
            }
          : { option: 'LAXVALETCARE_PLAN', plan: data.insurancePlan };
      await api.post(`/api/rentals/${bookingId}/insurance`, body);
      setStage('done');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Could not submit insurance');
    } finally {
      setSaving(false);
    }
  }

  if (stage === 'creating') {
    return (
      <View>
        <StepHeader title="Verification & insurance" step={2} totalSteps={7} onBack={onBack} />
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14 }}>Starting your rental…</Text>
        {error ? (
          <>
            <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 10 }}>{error}</Text>
            <View style={{ marginTop: 14 }}>
              <Button label="Try again" onPress={createBooking} />
            </View>
          </>
        ) : null}
      </View>
    );
  }

  if (stage === 'identity') {
    return (
      <View>
        <StepHeader title="Identity verification" step={2} totalSteps={7} onBack={onBack} />
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 16 }}>
          Booking {bookingCode} — required before any rental pickup.
        </Text>

        <Input label="Driver's licence number" value={data.dlNumber} onChangeText={(v) => update({ dlNumber: v })} />
        <Input label="Licence state" placeholder="CA" maxLength={2} autoCapitalize="characters" value={data.dlState} onChangeText={(v) => update({ dlState: v.toUpperCase().slice(0, 2) })} />
        <DateTimeField label="Licence expiry" value={data.dlExpiry} onChange={(d) => update({ dlExpiry: d })} />
        <DateTimeField label="Date of birth" value={data.dob} onChange={(d) => update({ dob: d })} />
        <Input label="Full legal name" value={data.fullLegalName} onChangeText={(v) => update({ fullLegalName: v })} />

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <PhotoPickerTile label="Licence — front" value={data.dlFrontUrl} onChange={(url) => update({ dlFrontUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
          </View>
          <View style={{ flex: 1 }}>
            <PhotoPickerTile label="Licence — back" value={data.dlBackUrl} onChange={(url) => update({ dlBackUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
          </View>
        </View>

        <Card>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: theme.colors.text }}>
            Selfie for identity match
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 4, marginBottom: 10 }}>
            Compared to your licence photo to confirm it's really you — deleted after matching, never stored.
          </Text>
          <View style={{ width: 140 }}>
            <PhotoPickerTile label="Selfie" value={data.selfieUrl} onChange={(url) => update({ selfieUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
          </View>
        </Card>

        <Text style={{ fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 20, marginBottom: 10 }}>
          Address & contact
        </Text>
        <Input label="Street address" value={data.addressStreet} onChangeText={(v) => update({ addressStreet: v })} />
        <Input label="Unit (optional)" value={data.addressUnit} onChangeText={(v) => update({ addressUnit: v })} />
        <Input label="City" value={data.addressCity} onChangeText={(v) => update({ addressCity: v })} />
        <Input label="State" placeholder="CA" maxLength={2} autoCapitalize="characters" value={data.addressState} onChangeText={(v) => update({ addressState: v.toUpperCase().slice(0, 2) })} />
        <Input label="ZIP" keyboardType="number-pad" value={data.addressZip} onChangeText={(v) => update({ addressZip: v })} />
        <Input label="Phone" keyboardType="phone-pad" value={data.phone} onChangeText={(v) => update({ phone: v })} />
        <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={data.email} onChangeText={(v) => update({ email: v })} />

        <Text style={{ fontFamily: theme.fonts.display, fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 8, marginBottom: 10 }}>
          Emergency contact
        </Text>
        <Input label="Name" value={data.emergencyContactName} onChangeText={(v) => update({ emergencyContactName: v })} />
        <Input label="Phone" keyboardType="phone-pad" value={data.emergencyContactPhone} onChangeText={(v) => update({ emergencyContactPhone: v })} />
        <Input label="Relationship" value={data.emergencyContactRelationship} onChangeText={(v) => update({ emergencyContactRelationship: v })} />

        {error ? <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginBottom: 10 }}>{error}</Text> : null}
        <Button label={saving ? 'Submitting…' : 'Submit verification'} onPress={submitIdentity} loading={saving} />
      </View>
    );
  }

  if (stage === 'insurance') {
    const days =
      data.pickupDate && data.returnDate
        ? Math.max(1, Math.ceil((data.returnDate.getTime() - data.pickupDate.getTime()) / 86400000))
        : 1;
    return (
      <View>
        <StepHeader title="Insurance" step={2} totalSteps={7} onBack={onBack} />
        <Text style={{ color: theme.colors.textMuted, fontFamily: theme.fonts.body, fontSize: 14, marginTop: -8, marginBottom: 16 }}>
          Every rental needs insurance on file before pickup.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <OptionChip label="My own insurance" active={data.insuranceOption === 'OWN'} onPress={() => update({ insuranceOption: 'OWN' })} theme={theme} />
          <OptionChip label="LAXValetCare plan" active={data.insuranceOption === 'LAXVALETCARE_PLAN'} onPress={() => update({ insuranceOption: 'LAXVALETCARE_PLAN' })} theme={theme} />
        </View>

        {data.insuranceOption === 'OWN' ? (
          <View>
            <Input label="Insurance company" value={data.insuranceCompany} onChangeText={(v) => update({ insuranceCompany: v })} />
            <Input label="Policy number" value={data.insurancePolicyNumber} onChangeText={(v) => update({ insurancePolicyNumber: v })} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <PhotoPickerTile label="Insurance card — front" value={data.insuranceCardFrontUrl} onChange={(url) => update({ insuranceCardFrontUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
              </View>
              <View style={{ flex: 1 }}>
                <PhotoPickerTile label="Insurance card — back" value={data.insuranceCardBackUrl} onChange={(url) => update({ insuranceCardBackUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
              </View>
            </View>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((plan) => {
              const perDay = pricing
                ? plan === 'BASIC'
                  ? pricing.rentalInsurance.basicPerDayCents
                  : plan === 'STANDARD'
                    ? pricing.rentalInsurance.standardPerDayCents
                    : pricing.rentalInsurance.premiumPerDayCents
                : 0;
              const active = data.insurancePlan === plan;
              return (
                <Pressable
                  key={plan}
                  onPress={() => update({ insurancePlan: plan })}
                  style={{
                    padding: 14, borderRadius: theme.radii.card, borderWidth: active ? 1.5 : 1,
                    borderColor: active ? theme.colors.text : theme.colors.border, backgroundColor: theme.colors.surface,
                  }}
                >
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: theme.colors.text }}>
                    {plan.charAt(0) + plan.slice(1).toLowerCase()}
                  </Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>
                    {formatCents(perDay)}/day{pricing ? ` · ${formatCents(perDay * days)} total` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {error ? <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 14, marginBottom: 4 }}>{error}</Text> : null}
        <View style={{ marginTop: 16 }}>
          <Button label={saving ? 'Submitting…' : 'Submit insurance'} onPress={submitInsurance} loading={saving} />
        </View>
      </View>
    );
  }

  // stage === 'done'
  return (
    <View>
      <StepHeader title="Verification submitted" step={2} totalSteps={7} onBack={onBack} />
      <Card>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: '700', color: theme.colors.text }}>
          ⏳ Insurance — pending verification, usually under 1 hour
        </Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, color: theme.colors.textMuted, marginTop: 8, lineHeight: 18 }}>
          Our team reviews every policy by hand — we never auto-approve. You'll get a notification the moment it's
          confirmed, and you can keep completing your booking in the meantime.
        </Text>
      </Card>
      <View style={{ marginTop: 20 }}>
        <Button label="Continue" onPress={onNext} />
      </View>
    </View>
  );
}

function OptionChip({ label, active, onPress, theme }: { label: string; active: boolean; onPress: () => void; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10,
        borderRadius: theme.radii.card, borderWidth: 1,
        borderColor: active ? theme.colors.text : theme.colors.border,
        backgroundColor: active ? theme.colors.inverseBackground : theme.colors.surface,
      }}
    >
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, fontWeight: '700', color: active ? theme.colors.inverseText : theme.colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}
