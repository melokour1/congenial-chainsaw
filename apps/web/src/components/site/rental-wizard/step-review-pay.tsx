'use client';

import type { PriceBreakdown } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { Button, Card } from '@/components/ui';
import { stripePublishableKey } from '@/components/site/lib/stripe-client';

export function StepReviewPay({
  breakdown,
  onSubmit,
  onBack,
  submitting,
  submitError,
}: {
  breakdown: PriceBreakdown | null;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  const publishableKey = stripePublishableKey();

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Review &amp; pay</h2>
      <p className="mt-1 text-sm text-medium-gray">Here&rsquo;s your full price, including any add-ons and insurance.</p>

      <Card className="mt-6 border border-light-gray dark:border-[#2A2A2A]">
        {breakdown ? (
          <>
            <ul className="flex flex-col gap-4">
              {breakdown.lineItems.map((li, i) => (
                <li key={i} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <div className="font-medium">{li.label}</div>
                    {li.detail && <div className="mt-0.5 text-xs text-medium-gray">{li.detail}</div>}
                  </div>
                  <span className="whitespace-nowrap tabular-nums">{formatCents(li.cents)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-2 border-t border-light-gray pt-4 text-sm dark:border-[#2A2A2A]">
              <div className="flex justify-between text-medium-gray">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCents(breakdown.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-medium-gray">
                <span>Tax ({breakdown.taxPct}%)</span>
                <span className="tabular-nums">{formatCents(breakdown.taxCents)}</span>
              </div>
              <div className="flex justify-between text-medium-gray">
                <span>Service fee ({breakdown.serviceFeePct}%)</span>
                <span className="tabular-nums">{formatCents(breakdown.serviceFeeCents)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-light-gray pt-4 font-display text-lg font-bold dark:border-[#2A2A2A]">
              <span>Total</span>
              <span className="tabular-nums">{formatCents(breakdown.totalCents)}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-medium-gray">Calculating price…</p>
        )}
      </Card>

      {!publishableKey ? (
        <p className="mt-4 rounded-card border border-light-gray bg-off-white p-3 text-xs text-medium-gray dark:border-[#2A2A2A] dark:bg-dark-gray">
          Payment setup pending — your rental will be created without payment for now. We&rsquo;ll email you a
          payment link once card payments are enabled. A security deposit hold will also be requested before pickup.
        </p>
      ) : (
        <p className="mt-4 rounded-card border border-light-gray bg-off-white p-3 text-xs text-medium-gray dark:border-[#2A2A2A] dark:bg-dark-gray">
          You&rsquo;ll be prompted to complete payment and the security deposit hold on the confirmation screen.
        </p>
      )}

      {submitError && <p className="mt-4 text-sm text-red-500">{submitError}</p>}

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" className="h-12 px-8" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button variant="primary" className="h-12 px-8" onClick={onSubmit} disabled={submitting || !breakdown}>
          {submitting ? 'Finalizing…' : 'Confirm rental'}
        </Button>
      </div>
    </div>
  );
}
