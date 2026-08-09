import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Configure this URL (yourdomain/api/stripe/webhook) in the Stripe dashboard once STRIPE_WEBHOOK_SECRET is set. */
export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 501 });
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as { id: string; metadata: { kind?: string; targetId?: string } };
    const admin = createAdminClient();
    if (intent.metadata?.kind === 'RESERVATION' && intent.metadata.targetId) {
      await admin.from('reservations').update({ stripePaymentIntentId: intent.id }).eq('id', intent.metadata.targetId);
    } else if (intent.metadata?.kind === 'RENTAL' && intent.metadata.targetId) {
      await admin.from('rental_bookings').update({ stripePaymentIntentId: intent.id }).eq('id', intent.metadata.targetId);
    }
  }

  return NextResponse.json({ received: true });
}
