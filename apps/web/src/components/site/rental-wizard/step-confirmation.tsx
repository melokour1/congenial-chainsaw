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
  depositHoldCents,
}: {
  bookingId: string;
  bookingCode: string;
  breakdown: PriceBreakdown | null;
  depositHoldCents: number;
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
        body: JSON.stringify({
          amountCents: breakdown.totalCents,
          kind: 'RENTAL',
          targetId: bookingId,
          depositCents: depositHoldCents,
        }),
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
        <h2 className="mt-4 font-display text-3xl font-bold">Rental confirmed</h2>
        <p className="mt-1 text-medium-gray">Confirmation code</p>
        <p className="font-display text-2xl font-bold tracking-wide">{bookingCode}</p>
      </div>

      {breakdown && (
        <Card className="mt-8 border border-light-gray dark:border-[#2A2A2A]">
          <div className="flex justify-between font-display text-lg font-bold">
            <span>Total</span>
            <span>{formatCents(breakdown.totalCents)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-medium-gray">
            <span>Security deposit hold</span>
            <span>{formatCents(depositHoldCents)}</span>
          </div>
        </Card>
      )}

      <Card className="mt-4 border border-light-gray dark:border-[#2A2A2A]">
        <h3 className="font-display text-base font-bold">Payment</h3>
        {paymentState === 'unavailable' && (
          <p className="mt-2 text-sm text-medium-gray">
            Payment setup pending — this rental was created without payment. We&rsquo;ll follow up by email once
            card payments are enabled, including the refundable security deposit hold.
          </p>
        )}
        {paymentState === 'loading' && <p className="mt-2 text-sm text-medium-gray">Preparing secure payment…</p>}
        {(paymentState === 'ready' || paymentState === 'paying') && (
          <div className="mt-3">
            <div id="payment-element" />
            {paymentError && <p className="mt-2 text-sm text-red-500">{paymentError}</p>}
            <Button variant="primary" className="mt-3 h-12 w-full" onClick={handlePay} disabled={paymentState === 'paying'}>
              {paymentState === 'paying' ? 'Processing…' : 'Pay & hold deposit'}
            </Button>
          </div>
        )}
        {paymentState === 'paid' && <p className="mt-2 text-sm">Payment received — thank you!</p>}
      </Card>

      <Card className="mt-4 border border-light-gray dark:border-[#2A2A2A]">
        <p className="text-sm font-semibold">⏳ Insurance — pending verification</p>
        <p className="mt-1 text-xs text-medium-gray">
          We&rsquo;ll email you once it&rsquo;s approved. Your vehicle isn&rsquo;t released until then.
        </p>
      </Card>

      <div className="mt-8">
        <Link href="/account/activity">
          <Button variant="primary" className="h-12 w-full">View in Activity</Button>
        </Link>
      </div>
    </div>
  );
}
