import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';

/** Admin > "Send Notification" button (reservation/rental detail, or ad-hoc from Notifications page). */
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || profile.role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { profileId, title, body, type, reservationId, rentalBookingId } = (await request.json()) as {
    profileId: string; title: string; body: string; type?: string; reservationId?: string; rentalBookingId?: string;
  };
  if (!profileId || !title || !body) return NextResponse.json({ error: 'profileId, title, body required' }, { status: 400 });

  await sendNotification({
    profileId, title, body, type: type ?? 'ADMIN_MESSAGE',
    reservationId, rentalBookingId,
  });

  return NextResponse.json({ ok: true });
}
