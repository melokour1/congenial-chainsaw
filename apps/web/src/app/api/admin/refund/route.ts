import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * [Process Refund] stub (spec 3.3). Attempts a real Stripe refund when STRIPE_SECRET_KEY
 * and a stripePaymentIntentId are present; otherwise no-ops gracefully and just logs the
 * intent to activity_logs so admins have a paper trail until Stripe is wired up.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { reservationId, rentalBookingId, amountCents, reason } = (await request.json()) as {
    reservationId?: string; rentalBookingId?: string; amountCents?: number; reason?: string;
  };
  if (!reservationId && !rentalBookingId) return NextResponse.json({ error: 'reservationId or rentalBookingId required' }, { status: 400 });

  const admin = createAdminClient();
  const table = reservationId ? 'reservations' : 'rental_bookings';
  const id = (reservationId ?? rentalBookingId)!;
  const { data: record } = await admin.from(table).select('stripePaymentIntentId').eq('id', id).single();

  let refunded = false;
  let note = 'Refund requested — STRIPE_SECRET_KEY not configured; logged for manual processing.';

  if (process.env.STRIPE_SECRET_KEY && record?.stripePaymentIntentId) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      await stripe.refunds.create({
        payment_intent: record.stripePaymentIntentId,
        amount: amountCents,
      });
      refunded = true;
      note = `Refund of ${amountCents ? `$${(amountCents / 100).toFixed(2)}` : 'full amount'} processed via Stripe.`;
    } catch (err: any) {
      note = `Stripe refund attempt failed: ${err.message ?? 'unknown error'}`;
    }
  }

  await admin.from('activity_logs').insert({
    id: crypto.randomUUID(),
    reservationId: reservationId ?? null,
    rentalBookingId: rentalBookingId ?? null,
    actorId: user!.id,
    action: refunded ? 'Refund processed' : 'Refund requested (stub)',
    detail: { amountCents: amountCents ?? null, reason: reason ?? null, note },
  });

  return NextResponse.json({ refunded, note });
}
