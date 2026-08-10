import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { uploadDataUrl } from '@/lib/storage';

interface UploadPhotoBody {
  dataUrl: string;
  stage: 'PICKUP' | 'RETURN' | 'ADDON' | 'RENTAL_PICKUP' | 'RENTAL_RETURN';
  reservationId?: string;
  rentalBookingId?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { dataUrl, stage, reservationId, rentalBookingId } = (await request.json()) as UploadPhotoBody;
  if (!dataUrl || !stage) return NextResponse.json({ error: 'dataUrl and stage are required' }, { status: 400 });

  const isDocument = stage === 'RENTAL_PICKUP' || stage === 'RENTAL_RETURN';
  const bucket = 'photos'; // vehicle condition photos are shown to customers — always public
  const path = `${reservationId ?? rentalBookingId ?? 'misc'}/${stage.toLowerCase()}/${crypto.randomUUID()}.jpg`;
  const url = await uploadDataUrl(bucket, path, dataUrl);

  const admin = createAdminClient();
  const id = crypto.randomUUID();
  await admin.from('photos').insert({
    id, reservationId: reservationId ?? null, rentalBookingId: rentalBookingId ?? null,
    url, stage, takenByValetId: user.id,
  });

  return NextResponse.json({ id, url }, { status: 201 });
}
