import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CreateIntentBody {
  amountCents: number;
  currency?: string;
  kind: 'RESERVATION' | 'RENTAL';
  targetId: string;
  /** For rentals: an additional auth-only hold for the security deposit. */
  depositCents?: number;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to apps/web/.env.local (test mode is fine).' },
      { status: 501 },
    );
  }

  const { amountCents, currency = 'usd', kind, targetId, depositCents } = (await request.json()) as CreateIntentBody;

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    automatic_payment_methods: { enabled: true }, // card, Apple Pay, Google Pay
    metadata: { kind, targetId, customerId: user.id },
  });

  let depositIntent = null;
  if (depositCents) {
    depositIntent = await stripe.paymentIntents.create({
      amount: depositCents,
      currency,
      capture_method: 'manual', // auth hold only — Admin > Payments captures/releases later
      automatic_payment_methods: { enabled: true },
      metadata: { kind: 'DEPOSIT', targetId, customerId: user.id },
    });
  }

  return NextResponse.json({
    clientSecret: intent.client_secret,
    depositClientSecret: depositIntent?.client_secret ?? null,
  });
}
