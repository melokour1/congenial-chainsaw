import { NextResponse } from 'next/server';
import { rentalInsuranceSchema } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNotification } from '@/lib/notifications';

/** Customer submits insurance info (own policy or a LAXValetCare plan) — always PENDING until an admin approves. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = rentalInsuranceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const { insuranceCardFrontUrl, insuranceCardBackUrl } = body as { insuranceCardFrontUrl?: string; insuranceCardBackUrl?: string };

  const admin = createAdminClient();
  const update: Record<string, unknown> = {
    insuranceOption: input.option,
    insuranceStatus: 'PENDING',
    insuranceRejectionReason: null,
  };
  if (input.option === 'OWN') {
    Object.assign(update, {
      insuranceCompany: input.insuranceCompany,
      insurancePolicyNumber: input.insurancePolicyNumber,
      insuranceCardFrontUrl: insuranceCardFrontUrl ?? null,
      insuranceCardBackUrl: insuranceCardBackUrl ?? null,
    });
  } else {
    update.insurancePlan = input.plan;
  }

  const { error } = await admin.from('rental_bookings').update(update).eq('id', id).eq('customerId', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ insuranceStatus: 'PENDING' });
}

/** Admin approves/rejects — the only way insuranceStatus ever leaves PENDING (spec 6.2: no auto-approvals). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { decision, reason } = (await request.json()) as { decision: 'APPROVED' | 'REJECTED'; reason?: string };
  const admin = createAdminClient();
  const { data: rental } = await admin.from('rental_bookings').select('customerId').eq('id', id).single();
  if (!rental) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await admin.from('rental_bookings').update({
    insuranceStatus: decision,
    insuranceRejectionReason: decision === 'REJECTED' ? reason ?? null : null,
    status: decision === 'APPROVED' ? 'READY' : 'PENDING_INSURANCE',
  }).eq('id', id);

  await sendNotification({
    profileId: rental.customerId,
    title: decision === 'APPROVED' ? 'Insurance verified ✅' : 'Updated insurance needed',
    body: decision === 'APPROVED' ? 'Vehicle ready for pickup!' : (reason ?? 'Please re-upload your insurance information.'),
    type: `RENTAL_INSURANCE_${decision}`,
    rentalBookingId: id,
  });

  return NextResponse.json({ insuranceStatus: decision });
}
