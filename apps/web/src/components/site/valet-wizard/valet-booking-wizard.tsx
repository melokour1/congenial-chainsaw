'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { OriginType, PriceBreakdown, PricingConfig } from '@laxvaletcare/shared';
import { calcValetPrice } from '@laxvaletcare/shared';
import { cn } from '@/lib/utils';
import { STEP_LABELS, initialWizardData, type ValetWizardData } from './types';
import { StepOrigin } from './step-origin';
import { StepTerminalFlight } from './step-terminal-flight';
import { StepVehicle } from './step-vehicle';
import { StepServiceTier } from './step-service-tier';
import { StepAddOns } from './step-addons';
import { StepGratuity } from './step-gratuity';
import { StepReviewPay } from './step-review-pay';
import { StepConfirmation } from './step-confirmation';
import { isoFromLocalInput } from '@/components/site/lib/format';

export function ValetBookingWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ValetWizardData>(() =>
    initialWizardData({
      originType: (searchParams.get('origin') as OriginType) || 'LAX',
      departureDate: searchParams.get('departureDate') || '',
      returnDateEstimate: searchParams.get('returnDate') || '',
    }),
  );
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; bookingCode: string; breakdown: PriceBreakdown } | null>(null);

  useEffect(() => {
    fetch('/api/pricing')
      .then((res) => res.json())
      .then(setPricing)
      .catch(() => setPricing(null));
  }, []);

  function update(patch: Partial<ValetWizardData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  const breakdown = useMemo<PriceBreakdown | null>(() => {
    if (!pricing || !data.departureDate || !data.returnDateEstimate) return null;
    try {
      return calcValetPrice(
        {
          departureDate: new Date(data.departureDate),
          returnDateEstimate: new Date(data.returnDateEstimate),
          serviceTier: data.serviceTier,
          vipPersonCount: data.vipPersonCount,
          addOns: data.addOns,
          gratuityCents: data.gratuityCents,
        },
        pricing,
      );
    } catch {
      return null;
    }
  }, [pricing, data.departureDate, data.returnDateEstimate, data.serviceTier, data.vipPersonCount, data.addOns, data.gratuityCents]);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const departureIso = isoFromLocalInput(data.departureDate);
      const returnIso = isoFromLocalInput(data.returnDateEstimate);
      if (!departureIso || !returnIso) throw new Error('Please provide valid departure and return dates.');

      const payload = {
        originType: data.originType,
        terminalCode: data.originType === 'LAX' ? data.terminalCode || undefined : undefined,
        airline: data.originType === 'LAX' ? (data.airline === '__other__' ? data.airlineOther : data.airline) || undefined : undefined,
        departureDate: departureIso,
        returnDateEstimate: returnIso,
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

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Something went wrong' }));
        throw new Error(typeof err.error === 'string' ? err.error : 'Could not create booking — please check your details.');
      }
      const json = await res.json();
      setResult({ id: json.id, bookingCode: json.bookingCode, breakdown: json.priceBreakdown });
      setStep(7);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const isLastEditableStep = step === 6;

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      {step < 7 && (
        <div className="mb-8">
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.slice(0, 7).map((label, i) => (
              <div
                key={label}
                className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-black dark:bg-white' : 'bg-light-gray dark:bg-[#2A2A2A]')}
              />
            ))}
          </div>
          <p className="mt-2 text-xs font-medium text-medium-gray">
            Step {step + 1} of 7 — {STEP_LABELS[step]}
          </p>
        </div>
      )}

      {step === 0 && <StepOrigin data={data} update={update} onNext={() => setStep(1)} />}
      {step === 1 && (
        <StepTerminalFlight data={data} update={update} onNext={() => setStep(2)} onBack={() => setStep(0)} />
      )}
      {step === 2 && <StepVehicle data={data} update={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && (
        <StepServiceTier data={data} update={update} pricing={pricing} onNext={() => setStep(4)} onBack={() => setStep(2)} />
      )}
      {step === 4 && (
        <StepAddOns data={data} update={update} pricing={pricing} onNext={() => setStep(5)} onBack={() => setStep(3)} />
      )}
      {step === 5 && <StepGratuity data={data} update={update} onNext={() => setStep(6)} onBack={() => setStep(4)} />}
      {isLastEditableStep && (
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
      {step === 7 && result && (
        <StepConfirmation bookingId={result.id} bookingCode={result.bookingCode} breakdown={result.breakdown} />
      )}
    </div>
  );
}
