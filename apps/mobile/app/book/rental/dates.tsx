import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { PriceBreakdown, PricingConfig } from '@laxvaletcare/shared';
import { getPricingConfig } from '../../../src/lib/pricing';
import { api, ApiError } from '../../../src/lib/api';
import { supabase } from '../../../src/lib/supabase';
import { ScreenContainer } from '../../../src/components/ui';
import { useTheme } from '../../../src/lib/ThemeProvider';
import type { FleetVehicle } from '../../../src/lib/types';
import { initialRentalWizardData, type RentalWizardData } from '../../../src/components/booking/rental/types';
import { StepDatesDelivery } from '../../../src/components/booking/rental/StepDatesDelivery';
import { StepBrowseFleet } from '../../../src/components/booking/rental/StepBrowseFleet';
import { StepVerification } from '../../../src/components/booking/rental/StepVerification';
import { StepAgreement } from '../../../src/components/booking/rental/StepAgreement';
import { StepAddOns } from '../../../src/components/booking/rental/StepAddOns';
import { StepReviewPay } from '../../../src/components/booking/rental/StepReviewPay';
import { StepConfirmation } from '../../../src/components/booking/rental/StepConfirmation';

/**
 * Orchestrates the 7-step rental flow — mirrors apps/web's rental-booking-wizard.tsx.
 * StepVerification creates the booking (POST /api/rentals) plus submits identity +
 * insurance; the Agreement and Add-ons steps here PATCH /api/rentals/[id] to persist the
 * signed agreement and recalculate totalCents/priceBreakdown once the real insurance
 * choice and add-ons are known (the initial POST only ever creates a placeholder total).
 */
export default function RentalBookingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<RentalWizardData>(() => initialRentalWizardData());
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [vehicle, setVehicle] = useState<FleetVehicle | null>(null);

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState<boolean | null>(null);

  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update(patch: Partial<RentalWizardData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  useEffect(() => {
    getPricingConfig().then(setPricing);
  }, []);

  useEffect(() => {
    if (!data.fleetVehicleId) {
      setVehicle(null);
      return;
    }
    let cancelled = false;
    Promise.resolve(supabase.from('fleet_vehicles').select('*').eq('id', data.fleetVehicleId).single()).then(({ data: row }) => {
      if (!cancelled) setVehicle((row as FleetVehicle) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [data.fleetVehicleId]);

  async function handleAgreementNext() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (bookingId && data.signatureUrl) {
        await api.patch(`/api/rentals/${bookingId}`, { agreementSignatureUrl: data.signatureUrl });
      }
      setStep(4);
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddOnsNext() {
    if (!bookingId) {
      setStep(5);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const json = await api.patch<{ ok: true; priceBreakdown: PriceBreakdown; totalCents: number }>(`/api/rentals/${bookingId}`, {
        extraDriver: data.extraDriver,
        childSeat: data.childSeat,
      });
      setBreakdown(json.priceBreakdown);
      setStep(5);
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const depositHoldCents = pricing?.securityDepositCents.min ?? 0;

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      {step === 0 && (
        <StepDatesDelivery data={data} update={update} pricing={pricing} onNext={() => setStep(1)} onClose={() => router.back()} />
      )}
      {step === 1 && <StepBrowseFleet data={data} update={update} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && (
        <StepVerification
          data={data}
          update={update}
          pricing={pricing}
          bookingId={bookingId}
          bookingCode={bookingCode}
          needsVerification={needsVerification}
          onBookingCreated={(result) => {
            setBookingId(result.id);
            setBookingCode(result.bookingCode);
            setNeedsVerification(result.needsVerification);
          }}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <>
          <StepAgreement
            data={data}
            update={update}
            vehicle={vehicle}
            bookingCode={bookingCode}
            bookingId={bookingId}
            onNext={handleAgreementNext}
            onBack={() => setStep(2)}
          />
          {submitError ? <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 12 }}>{submitError}</Text> : null}
        </>
      )}
      {step === 4 && (
        <>
          <StepAddOns data={data} update={update} onNext={handleAddOnsNext} onBack={() => setStep(3)} />
          {submitError ? <Text style={{ color: theme.colors.danger, fontFamily: theme.fonts.body, fontSize: 13, marginTop: 12 }}>{submitError}</Text> : null}
        </>
      )}
      {step === 5 && (
        <StepReviewPay breakdown={breakdown} onSubmit={() => setStep(6)} onBack={() => setStep(4)} submitting={submitting} submitError={submitError} />
      )}
      {step === 6 && bookingId && bookingCode && (
        <StepConfirmation bookingCode={bookingCode} breakdown={breakdown} depositHoldCents={depositHoldCents} />
      )}
    </ScreenContainer>
  );
}
