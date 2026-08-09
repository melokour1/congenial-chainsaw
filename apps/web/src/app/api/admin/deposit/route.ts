import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Admin > Payments — rental deposit [Capture]/[Release]. Stubs gracefully if STRIPE_SECRET_KEY isn't set. */
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { rentalBookingId, action } = (await request.json()) as { rentalBookingId: string; action: 'CAPTURE' | 'RELEASE' };
  const admin = createAdminClient();
  const { data: rental } = await admin.from('rental_bookings').select('depositHoldCents, stripePaymentIntentId').eq('id', rentalBookingId).single();
  if (!rental) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const note = process.env.STRIPE_SECRET_KEY
    ? `${action === 'CAPTURE' ? 'Deposit capture' : 'Deposit release'} requested — implement Stripe deposit logic for payment intent ${rental.stripePaymentIntentId ?? '(none on file)'}.`
    : `${action === 'CAPTURE' ? 'Deposit capture' : 'Deposit release'} requested — STRIPE_SECRET_KEY not configured; logged for manual processing.`;

  await admin.from('activity_logs').insert({
    id: crypto.randomUUID(),
    rentalBookingId,
    actorId: user!.id,
    action: `${action === 'CAPTURE' ? 'Deposit captured (stub)' : 'Deposit released (stub)'}`,
    detail: { depositHoldCents: rental.depositHoldCents, note },
  });

  return NextResponse.json({ ok: true, note });
}
