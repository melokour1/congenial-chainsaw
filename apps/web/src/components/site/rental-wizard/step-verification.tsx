'use client';

import { useEffect, useState } from 'react';
import type { PricingConfig } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/client';
import { Button, Card } from '@/components/ui';
import { InlineAuthGate } from '@/components/site/inline-auth-gate';
import { PhotoUploadTile } from '@/components/site/photo-upload-tile';
import { isoFromLocalInput } from '@/components/site/lib/format';
import type { RentalWizardData } from './types';

type Stage = 'checking' | 'auth' | 'creating' | 'identity' | 'insurance' | 'done';

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
  const [stage, setStage] = useState<Stage>('checking');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: userData }) => {
      if (!userData.user) {
        setStage('auth');
      } else if (bookingId) {
        setStage(needsVerification ? 'identity' : 'insurance');
      } else {
        setStage('creating');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createBooking() {
    setStage('creating');
    setError(null);
    try {
      const pickupIso = isoFromLocalInput(data.pickupDate);
      const returnIso = isoFromLocalInput(data.returnDate);
      if (!pickupIso || !returnIso) throw new Error('Missing pickup/return dates.');
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fleetVehicleId: data.fleetVehicleId,
          pickupDate: pickupIso,
          returnDate: returnIso,
          deliveryMethod: data.deliveryMethod,
          deliveryAddress: data.deliveryMethod === 'HOME' ? data.deliveryAddress : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Could not start rental' }));
        throw new Error(typeof err.error === 'string' ? err.error : 'Could not start rental');
      }
      const json = await res.json();
      onBookingCreated({ id: json.id, bookingCode: json.bookingCode, needsVerification: json.needsVerification });
      setStage(json.needsVerification ? 'identity' : 'insurance');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start rental');
      setStage('auth'); // fall back to a retry-able state
    }
  }

  useEffect(() => {
    if (stage === 'creating' && !bookingId) {
      createBooking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  async function submitIdentity() {
    if (!bookingId) return;
    setSaving(true);
    setError(null);
    try {
      const dlExpiryIso = data.dlExpiry ? new Date(data.dlExpiry).toISOString() : null;
      const dobIso = data.dob ? new Date(data.dob).toISOString() : null;
      if (!dlExpiryIso || !dobIso) throw new Error('Please provide a valid licence expiry and date of birth.');
      if (!data.dlFrontUrl || !data.dlBackUrl) throw new Error('Please upload photos of both sides of your licence.');

      const res = await fetch(`/api/rentals/${bookingId}/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dlNumber: data.dlNumber,
          dlState: data.dlState,
          dlExpiry: dlExpiryIso,
          dob: dobIso,
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
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Verification failed' }));
        throw new Error(typeof err.error === 'string' ? err.error : 'Verification failed — please check your details.');
      }
      setStage('insurance');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
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

      const res = await fetch(`/api/rentals/${bookingId}/insurance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Could not submit insurance' }));
        throw new Error(typeof err.error === 'string' ? err.error : 'Could not submit insurance');
      }
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit insurance');
    } finally {
      setSaving(false);
    }
  }

  if (stage === 'checking' || stage === 'creating') {
    return <p className="text-sm text-medium-gray">{stage === 'creating' ? 'Starting your rental…' : 'Checking your session…'}</p>;
  }

  if (stage === 'auth') {
    return (
      <div>
        <h2 className="font-display text-2xl font-bold">Sign in to continue</h2>
        <p className="mt-1 text-sm text-medium-gray">Identity verification requires a LAXValetCare account.</p>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <div className="mt-6 max-w-md">
          <InlineAuthGate onSignedIn={() => setStage('creating')} />
        </div>
        <div className="mt-8">
          <Button variant="secondary" className="h-12 px-8" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'identity') {
    return (
      <div>
        <h2 className="font-display text-2xl font-bold">Identity verification</h2>
        <p className="mt-1 text-sm text-medium-gray">Booking {bookingCode} — required before any rental pickup.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Driver's licence number" value={data.dlNumber} onChange={(v) => update({ dlNumber: v })} />
          <Field label="Licence state" value={data.dlState} onChange={(v) => update({ dlState: v.toUpperCase().slice(0, 2) })} placeholder="CA" />
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Licence expiry
            <input type="date" value={data.dlExpiry} onChange={(e) => update({ dlExpiry: e.target.value })} className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Date of birth
            <input type="date" value={data.dob} onChange={(e) => update({ dob: e.target.value })} className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]" />
          </label>
          <Field label="Full legal name" value={data.fullLegalName} onChange={(v) => update({ fullLegalName: v })} className="sm:col-span-2" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PhotoUploadTile label="Licence — front" value={data.dlFrontUrl} onChange={(url) => update({ dlFrontUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
          <PhotoUploadTile label="Licence — back" value={data.dlBackUrl} onChange={(url) => update({ dlBackUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
        </div>

        <Card className="mt-6 border border-light-gray dark:border-[#2A2A2A]">
          <p className="text-sm font-semibold">Selfie for identity match</p>
          <p className="mt-1 text-xs text-medium-gray">
            Compared to your licence photo to confirm it&rsquo;s really you — deleted after matching, never stored.
          </p>
          <div className="mt-3 max-w-[220px]">
            <PhotoUploadTile label="Selfie" value={data.selfieUrl} onChange={(url) => update({ selfieUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
          </div>
        </Card>

        <h3 className="mt-8 font-display text-lg font-bold">Address &amp; contact</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Street address" value={data.addressStreet} onChange={(v) => update({ addressStreet: v })} className="sm:col-span-2" />
          <Field label="Unit (optional)" value={data.addressUnit} onChange={(v) => update({ addressUnit: v })} />
          <Field label="City" value={data.addressCity} onChange={(v) => update({ addressCity: v })} />
          <Field label="State" value={data.addressState} onChange={(v) => update({ addressState: v.toUpperCase().slice(0, 2) })} placeholder="CA" />
          <Field label="ZIP" value={data.addressZip} onChange={(v) => update({ addressZip: v })} />
          <Field label="Phone" value={data.phone} onChange={(v) => update({ phone: v })} />
          <Field label="Email" value={data.email} onChange={(v) => update({ email: v })} type="email" />
        </div>

        <h3 className="mt-8 font-display text-lg font-bold">Emergency contact</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" value={data.emergencyContactName} onChange={(v) => update({ emergencyContactName: v })} />
          <Field label="Phone" value={data.emergencyContactPhone} onChange={(v) => update({ emergencyContactPhone: v })} />
          <Field label="Relationship" value={data.emergencyContactRelationship} onChange={(v) => update({ emergencyContactRelationship: v })} className="sm:col-span-2" />
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-8 flex justify-between">
          <Button variant="secondary" className="h-12 px-8" onClick={onBack} disabled={saving}>
            Back
          </Button>
          <Button variant="primary" className="h-12 px-8" onClick={submitIdentity} disabled={saving}>
            {saving ? 'Submitting…' : 'Submit verification'}
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'insurance') {
    const days = data.pickupDate && data.returnDate ? Math.max(1, Math.ceil((new Date(data.returnDate).getTime() - new Date(data.pickupDate).getTime()) / 86400000)) : 1;
    return (
      <div>
        <h2 className="font-display text-2xl font-bold">Insurance</h2>
        <p className="mt-1 text-sm text-medium-gray">Every rental needs insurance on file before pickup.</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => update({ insuranceOption: 'OWN' })}
            className={`min-h-[48px] flex-1 rounded-card border text-sm font-semibold ${data.insuranceOption === 'OWN' ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray dark:border-[#2A2A2A]'}`}
          >
            My own insurance
          </button>
          <button
            type="button"
            onClick={() => update({ insuranceOption: 'LAXVALETCARE_PLAN' })}
            className={`min-h-[48px] flex-1 rounded-card border text-sm font-semibold ${data.insuranceOption === 'LAXVALETCARE_PLAN' ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray dark:border-[#2A2A2A]'}`}
          >
            LAXValetCare plan
          </button>
        </div>

        {data.insuranceOption === 'OWN' ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Insurance company" value={data.insuranceCompany} onChange={(v) => update({ insuranceCompany: v })} />
            <Field label="Policy number" value={data.insurancePolicyNumber} onChange={(v) => update({ insurancePolicyNumber: v })} />
            <PhotoUploadTile label="Insurance card — front" value={data.insuranceCardFrontUrl} onChange={(url) => update({ insuranceCardFrontUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
            <PhotoUploadTile label="Insurance card — back" value={data.insuranceCardBackUrl} onChange={(url) => update({ insuranceCardBackUrl: url })} stage="RENTAL_PICKUP" rentalBookingId={bookingId ?? undefined} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                <button
                  key={plan}
                  type="button"
                  onClick={() => update({ insurancePlan: plan })}
                  className={`flex flex-col items-start gap-1 rounded-card border p-4 text-left ${active ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray dark:border-[#2A2A2A]'}`}
                >
                  <span className="text-sm font-semibold">{plan.charAt(0) + plan.slice(1).toLowerCase()}</span>
                  <span className="text-xs">{formatCents(perDay)}/day{pricing ? ` · ${formatCents(perDay * days)} total` : ''}</span>
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-8 flex justify-between">
          <Button variant="secondary" className="h-12 px-8" onClick={onBack} disabled={saving}>
            Back
          </Button>
          <Button variant="primary" className="h-12 px-8" onClick={submitInsurance} disabled={saving}>
            {saving ? 'Submitting…' : 'Submit insurance'}
          </Button>
        </div>
      </div>
    );
  }

  // stage === 'done'
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Verification submitted</h2>
      <Card className="mt-6 border border-light-gray dark:border-[#2A2A2A]">
        <p className="text-sm font-semibold">⏳ Insurance — pending verification, usually under 1 hour</p>
        <p className="mt-2 text-sm text-medium-gray">
          Our team reviews every policy by hand — we never auto-approve. You&rsquo;ll get a notification the
          moment it&rsquo;s confirmed, and you can keep completing your booking in the meantime.
        </p>
      </Card>
      <div className="mt-8 flex justify-between">
        <Button variant="secondary" className="h-12 px-8" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" className="h-12 px-8" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm font-semibold ${className ?? ''}`}>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
      />
    </label>
  );
}
