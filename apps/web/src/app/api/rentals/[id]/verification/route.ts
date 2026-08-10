import { NextResponse } from 'next/server';
import { rentalVerificationSchema } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Step 3 of rental booking: DL + personal info + emergency contact. Photos (DL front/back,
 * selfie) are uploaded separately via /api/photos to the private "documents" bucket first;
 * their URLs are passed in here. Face-match itself needs Stripe Identity/Onfido — see
 * FaceMatchStatus.MANUAL_REVIEW fallback and docs/HANDOFF.md for wiring a real provider.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = rentalVerificationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const { dlFrontUrl, dlBackUrl } = body as { dlFrontUrl: string; dlBackUrl: string };
  if (!dlFrontUrl || !dlBackUrl) return NextResponse.json({ error: 'dlFrontUrl and dlBackUrl are required' }, { status: 400 });

  if (new Date(input.dlExpiry) < new Date()) {
    return NextResponse.json({ error: 'Licence is expired' }, { status: 422 });
  }

  const admin = createAdminClient();
  const faceMatchStatus = process.env.ONFIDO_API_KEY || process.env.STRIPE_SECRET_KEY ? 'PENDING' : 'MANUAL_REVIEW';

  const { error } = await admin.from('rental_verifications').upsert({
    id: crypto.randomUUID(),
    customerId: user.id,
    dlNumber: input.dlNumber,
    dlState: input.dlState,
    dlExpiry: input.dlExpiry,
    dlFrontUrl,
    dlBackUrl,
    dob: input.dob,
    fullLegalName: input.fullLegalName,
    addressStreet: input.addressStreet,
    addressUnit: input.addressUnit ?? null,
    addressCity: input.addressCity,
    addressState: input.addressState,
    addressZip: input.addressZip,
    phone: input.phone,
    email: input.email,
    emergencyContactName: input.emergencyContactName,
    emergencyContactPhone: input.emergencyContactPhone,
    emergencyContactRelationship: input.emergencyContactRelationship,
    faceMatchStatus,
  }, { onConflict: 'customerId' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from('rental_bookings').update({ status: 'PENDING_INSURANCE' }).eq('id', id).eq('customerId', user.id);

  return NextResponse.json({ faceMatchStatus });
}
