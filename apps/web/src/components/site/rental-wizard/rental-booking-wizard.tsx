'use client';

import { useEffect, useState } from 'react';
import type { PriceBreakdown, PricingConfig } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { STEP_LABELS, initialRentalWizardData, type RentalWizardData, type FleetVehicleRow } from './types';
import { StepDatesDelivery } from './step-dates-delivery';
import { StepBrowseFleet } from './step-browse-fleet';
import { StepVerification } from './step-verification';
import { StepAgreement } from './step-agreement';
import { StepAddOns } from './step-addons';
import { StepReviewPay } from './step-review-pay';
import { StepConfirmation } from './step-confirmation';

/**
 * Orchestrates the 7-step rental flow. Two steps have side effects beyond local wizard
 * state: StepVerification creates the booking (POST /api/rentals) plus submits identity +
 * insurance; the Agreement and Add-ons steps here PATCH /api/rentals/[id] to persist the
 * signed agreement and recalculate totalCents/priceBreakdown once the real insurance
 * choice and add-ons are known (the initial POST only ever creates a placeholder total).
 */
export function RentalBookingWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<RentalWizardData>(() => initialRentalWizardData());
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [vehicle, setVehicle] = useState<FleetVehicleRow | null>(null);

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
    fetch('/api/pricing').then((res) => res.json()).then(setPricing).catch(() => setPricing(null));
  }, []);

  // Fetch the picked vehicle's full record once chosen — needed for the agreement text.
  useEffect(() => {
    if (!data.fleetVehicleId) {
      setVehicle(null);
      return;
    }
    const supabase = createClient();
    supabase
      .from('fleet_vehicles')
      .select('*')
      .eq('id', data.fleetVehicleId)
      .single()
      .then(({ data: row }) => setVehicle((row as FleetVehicleRow) ?? null));
  }, [data.fleetVehicleId]);

  async function handleAgreementNext() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (bookingId && data.signatureUrl) {
        const res = await fetch(`/api/rentals/${bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agreementSignatureUrl: data.signatureUrl }),
        });
        if (!res.ok) throw new Error('Could not save your signed agreement — please try again.');
      }
      setStep(4);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
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
      const res = await fetch(`/api/rentals/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraDriver: data.extraDriver, childSeat: data.childSeat }),
      });
      if (!res.ok) throw new Error('Could not finalize pricing — please try again.');
      const json = await res.json();
      setBreakdown(json.priceBreakdown);
      setStep(5);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const depositHoldCents = pricing?.securityDepositCents.min ?? 0;

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      {step < 6 && (
        <div className="mb-8">
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.slice(0, 6).map((label, i) => (
              <div
                key={label}
                className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-black dark:bg-white' : 'bg-light-gray dark:bg-[#2A2A2A]')}
              />
            ))}
          </div>
          <p className="mt-2 text-xs font-medium text-medium-gray">
            Step {step + 1} of 6 — {STEP_LABELS[step]}
          </p>
        </div>
      )}

      {step === 0 && <StepDatesDelivery data={data} update={update} pricing={pricing} onNext={() => setStep(1)} />}
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
          <StepAgreement data={data} update={update} vehicle={vehicle} bookingCode={bookingCode} bookingId={bookingId} onNext={handleAgreementNext} onBack={() => setStep(2)} />
          {submitError && <p className="mt-4 text-sm text-red-500">{submitError}</p>}
        </>
      )}
      {step === 4 && (
        <>
          <StepAddOns data={data} update={update} onNext={handleAddOnsNext} onBack={() => setStep(3)} />
          {submitError && <p className="mt-4 text-sm text-red-500">{submitError}</p>}
        </>
      )}
      {step === 5 && (
        <StepReviewPay breakdown={breakdown} onSubmit={() => setStep(6)} onBack={() => setStep(4)} submitting={submitting} submitError={submitError} />
      )}
      {step === 6 && bookingId && bookingCode && (
        <StepConfirmation bookingId={bookingId} bookingCode={bookingCode} breakdown={breakdown} depositHoldCents={depositHoldCents} />
      )}
    </div>
  );
}
