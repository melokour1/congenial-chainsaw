import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { PriceBreakdown, PricingConfig, ServiceTier } from '@laxvaletcare/shared';
import { calcValetPrice } from '@laxvaletcare/shared';
import { getPricingConfig } from '../../../src/lib/pricing';
import { api, ApiError } from '../../../src/lib/api';
import { ScreenContainer } from '../../../src/components/ui';
import { initialValetWizardData, type ValetWizardData } from '../../../src/components/booking/valet/types';
import { StepOrigin } from '../../../src/components/booking/valet/StepOrigin';
import { StepTerminalFlight } from '../../../src/components/booking/valet/StepTerminalFlight';
import { StepVehicle } from '../../../src/components/booking/valet/StepVehicle';
import { StepServiceTier } from '../../../src/components/booking/valet/StepServiceTier';
import { StepAddOns } from '../../../src/components/booking/valet/StepAddOns';
import { StepGratuity } from '../../../src/components/booking/valet/StepGratuity';
import { StepReviewPay } from '../../../src/components/booking/valet/StepReviewPay';
import { StepConfirmation } from '../../../src/components/booking/valet/StepConfirmation';

export default function ValetBookingScreen() {
  const router = useRouter();
  const { presetTier } = useLocalSearchParams<{ presetTier?: string }>();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<ValetWizardData>(() =>
    initialValetWizardData(presetTier ? { serviceTier: presetTier as ServiceTier } : undefined),
  );
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bookingCode: string; breakdown: PriceBreakdown } | null>(null);

  useEffect(() => {
    getPricingConfig().then(setPricing);
  }, []);

  function update(patch: Partial<ValetWizardData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  const breakdown: PriceBreakdown | null =
    pricing && data.departureDate && data.returnDateEstimate
      ? calcValetPrice(
          {
            departureDate: data.departureDate,
            returnDateEstimate: data.returnDateEstimate,
            serviceTier: data.serviceTier,
            vipPersonCount: data.vipPersonCount,
            addOns: data.addOns,
            gratuityCents: data.gratuityCents,
          },
          pricing,
        )
      : null;

  async function handleSubmit() {
    if (!data.departureDate || !data.returnDateEstimate) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        originType: data.originType,
        terminalCode: data.originType === 'LAX' ? data.terminalCode || undefined : undefined,
        airline: data.originType === 'LAX' ? (data.airline === '__other__' ? data.airlineOther : data.airline) || undefined : undefined,
        departureDate: data.departureDate.toISOString(),
        returnDateEstimate: data.returnDateEstimate.toISOString(),
        departingAirline: data.departingAirline,
        departingFlightNumber: data.departingFlightNumber,
        returningAirline: data.skipReturnFlight ? undefined : data.returningAirline || undefined,
        returningFlightNumber: data.skipReturnFlight ? undefined : data.returningFlightNumber || undefined,
        bagsInfo: data.bagsInfo || undefined,
        color: data.color,
        make: data.make,
        model: data.model,
        transmission: data.transmission,
        plate: data.skipPlate ? undefined : data.plate || undefined,
        serviceTier: data.serviceTier,
        vipPersonCount: data.serviceTier !== 'STANDARD' ? data.vipPersonCount : undefined,
        addOns: data.addOns,
        gratuityCents: data.gratuityCents,
        promoCode: data.promoCode || undefined,
      };
      const json = await api.post<{ id: string; bookingCode: string; priceBreakdown: PriceBreakdown }>('/api/reservations', payload);
      setResult({ bookingCode: json.bookingCode, breakdown: json.priceBreakdown });
      setStep(7);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (!pricing) {
    return <ScreenContainer edges={['top', 'bottom']} scroll={false}>{null}</ScreenContainer>;
  }

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      {step === 0 && <StepOrigin data={data} update={update} onNext={() => setStep(1)} onClose={() => router.back()} />}
      {step === 1 && <StepTerminalFlight data={data} update={update} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <StepVehicle data={data} update={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <StepServiceTier data={data} update={update} pricing={pricing} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
      {step === 4 && <StepAddOns data={data} update={update} pricing={pricing} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
      {step === 5 && <StepGratuity data={data} update={update} onNext={() => setStep(6)} onBack={() => setStep(4)} />}
      {step === 6 && (
        <StepReviewPay
          data={data}
          update={update}
          breakdown={breakdown}
          onSubmit={handleSubmit}
          onBack={() => setStep(5)}
          submitting={submitting}
          submitError={submitError}
        />
      )}
      {step === 7 && result && <StepConfirmation bookingCode={result.bookingCode} breakdown={result.breakdown} />}
    </ScreenContainer>
  );
}
