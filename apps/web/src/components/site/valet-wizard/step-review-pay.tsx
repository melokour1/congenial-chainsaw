'use client';

import { useEffect, useState } from 'react';
import type { PriceBreakdown } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/client';
import { Button, Card } from '@/components/ui';
import { InlineAuthGate } from '@/components/site/inline-auth-gate';
import { stripePublishableKey } from '@/components/site/lib/stripe-client';
import type { ValetWizardData } from './types';

export function StepReviewPay({
  data,
  update,
  breakdown,
  onSubmit,
  onBack,
  submitting,
  submitError,
}: {
  data: ValetWizardData;
  update: (patch: Partial<ValetWizardData>) => void;
  breakdown: PriceBreakdown | null;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const publishableKey = stripePublishableKey();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: userData }) => {
      setSignedIn(!!userData.user);
      setCheckingAuth(false);
    });
  }, []);

  if (checkingAuth) {
    return <p className="text-sm text-medium-gray">Checking your session…</p>;
  }

  if (!signedIn) {
    return (
      <div>
        <h2 className="font-display text-2xl font-bold">Almost there</h2>
        <p className="mt-1 text-sm text-medium-gray">Sign in to review pricing and confirm your booking.</p>
        <div className="mt-6 max-w-md">
          <InlineAuthGate onSignedIn={() => setSignedIn(true)} />
        </div>
        <div className="mt-8">
          <Button variant="secondary" className="h-12 px-8" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Review &amp; pay</h2>
      <p className="mt-1 text-sm text-medium-gray">Confirm your price before booking.</p>

      <Card className="mt-6 border border-light-gray dark:border-[#2A2A2A]">
        {breakdown ? (
          <>
            <ul className="flex flex-col gap-2">
              {breakdown.lineItems.map((li, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-medium-gray">{li.label}</span>
                  <span>{formatCents(li.cents)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-1.5 border-t border-light-gray pt-3 text-sm dark:border-[#2A2A2A]">
              <div className="flex justify-between text-medium-gray">
                <span>Subtotal</span>
                <span>{formatCents(breakdown.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-medium-gray">
                <span>Tax</span>
                <span>{formatCents(breakdown.taxCents)}</span>
              </div>
              <div className="flex justify-between text-medium-gray">
                <span>Service fee</span>
                <span>{formatCents(breakdown.serviceFeeCents)}</span>
              </div>
              {breakdown.gratuityCents > 0 && (
                <div className="flex justify-between text-medium-gray">
                  <span>Gratuity</span>
                  <span>{formatCents(breakdown.gratuityCents)}</span>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-between border-t border-light-gray pt-3 font-display text-lg font-bold dark:border-[#2A2A2A]">
              <span>Total</span>
              <span>{formatCents(breakdown.totalCents)}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-medium-gray">Calculating price…</p>
        )}
      </Card>

      <label className="mt-4 flex max-w-xs flex-col gap-1 text-sm font-semibold">
        Promo code
        <input
          type="text"
          value={data.promoCode}
          onChange={(e) => update({ promoCode: e.target.value.toUpperCase() })}
          placeholder="e.g. FIRSTVALET"
          className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal uppercase dark:border-[#2A2A2A]"
        />
      </label>

      <PaymentNotice publishableKey={publishableKey} />

      {submitError && <p className="mt-4 text-sm text-red-500">{submitError}</p>}

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" className="h-12 px-8" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button variant="primary" className="h-12 px-8" onClick={onSubmit} disabled={submitting || !breakdown}>
          {submitting ? 'Booking…' : 'Confirm booking'}
        </Button>
      </div>
    </div>
  );
}

function PaymentNotice({ publishableKey }: { publishableKey: string | null }) {
  if (!publishableKey) {
    return (
      <p className="mt-4 rounded-card border border-light-gray bg-off-white p-3 text-xs text-medium-gray dark:border-[#2A2A2A] dark:bg-dark-gray">
        Payment setup pending — your booking will be created without payment for now. We&rsquo;ll email you a
        payment link once card payments are enabled.
      </p>
    );
  }
  return (
    <p className="mt-4 rounded-card border border-light-gray bg-off-white p-3 text-xs text-medium-gray dark:border-[#2A2A2A] dark:bg-dark-gray">
      You&rsquo;ll be prompted to complete payment on the confirmation screen.
    </p>
  );
}
