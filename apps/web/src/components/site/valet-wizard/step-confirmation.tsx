'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { PriceBreakdown } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { Button, Card } from '@/components/ui';
import { getStripe, stripePublishableKey, type StripeElements } from '@/components/site/lib/stripe-client';

export function StepConfirmation({
  bookingId,
  bookingCode,
  breakdown,
}: {
  bookingId: string;
  bookingCode: string;
  breakdown: PriceBreakdown | null;
}) {
  const [paymentState, setPaymentState] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'paying' | 'paid' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const stripeRef = useRef<Awaited<ReturnType<typeof getStripe>> | null>(null);

  useEffect(() => {
    const publishableKey = stripePublishableKey();
    if (!publishableKey || !breakdown) {
      setPaymentState('unavailable');
      return;
    }
    let cancelled = false;
    setPaymentState('loading');

    (async () => {
      const res = await fetch('/api/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents: breakdown.totalCents, kind: 'RESERVATION', targetId: bookingId }),
      });
      if (!res.ok) {
        if (!cancelled) setPaymentState('unavailable');
        return;
      }
      const { clientSecret } = await res.json();
      if (!clientSecret) {
        if (!cancelled) setPaymentState('unavailable');
        return;
      }
      const stripe = await getStripe(publishableKey);
      if (!stripe || cancelled) {
        setPaymentState('unavailable');
        return;
      }
      stripeRef.current = stripe;
      const elements = stripe.elements({ clientSecret });
      elementsRef.current = elements;
      const paymentElement = elements.create('payment');
      setPaymentState('ready');
      // Mount on next tick once the DOM node exists.
      setTimeout(() => {
        if (!cancelled) paymentElement.mount('#payment-element');
      }, 0);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  async function handlePay() {
    if (!stripeRef.current || !elementsRef.current) return;
    setPaymentState('paying');
    setPaymentError(null);
    const result = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      redirect: 'if_required',
    });
    if (result.error) {
      setPaymentError(result.error.message);
      setPaymentState('ready');
      return;
    }
    setPaymentState('paid');
  }

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white dark:bg-white dark:text-black">
          ✓
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold">Booking confirmed</h2>
        <p className="mt-1 text-medium-gray">Confirmation code</p>
        <p className="font-display text-2xl font-bold tracking-wide">{bookingCode}</p>
      </div>

      {breakdown && (
        <Card className="mt-8 border border-light-gray dark:border-[#2A2A2A]">
          <div className="flex justify-between font-display text-lg font-bold">
            <span>Total</span>
            <span>{formatCents(breakdown.totalCents)}</span>
          </div>
        </Card>
      )}

      <Card className="mt-4 border border-light-gray dark:border-[#2A2A2A]">
        <h3 className="font-display text-base font-bold">Payment</h3>
        {paymentState === 'unavailable' && (
          <p className="mt-2 text-sm text-medium-gray">
            Payment setup pending — this booking was created without payment. We&rsquo;ll follow up by email once
            card payments are enabled.
          </p>
        )}
        {paymentState === 'loading' && <p className="mt-2 text-sm text-medium-gray">Preparing secure payment…</p>}
        {(paymentState === 'ready' || paymentState === 'paying') && (
          <div className="mt-3">
            <div id="payment-element" />
            {paymentError && <p className="mt-2 text-sm text-red-500">{paymentError}</p>}
            <Button variant="primary" className="mt-3 h-12 w-full" onClick={handlePay} disabled={paymentState === 'paying'}>
              {paymentState === 'paying' ? 'Processing…' : 'Pay now'}
            </Button>
          </div>
        )}
        {paymentState === 'paid' && <p className="mt-2 text-sm">Payment received — thank you!</p>}
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/account/activity" className="flex-1">
          <Button variant="primary" className="h-12 w-full">View in Activity</Button>
        </Link>
        <div className="group relative flex-1">
          <Button variant="secondary" className="h-12 w-full" disabled>
            Add to Apple Wallet
          </Button>
          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-card bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white dark:text-black">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
