import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Valet profile stats (spec 4.9): jobs completed, rating avg, tips total, plus a today slice. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'VALET' && profile.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: reservations } = await admin
    .from('reservations')
    .select('id, status, departureValetId, returnValetId, departureDate, returnDateEstimate, rating:ratings(stars, tipCents)')
    .or(`departureValetId.eq.${user.id},returnValetId.eq.${user.id}`)
    .eq('status', 'CLOSED');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  let jobsCompleted = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let tipsTotalCents = 0;
  let todayJobsCompleted = 0;
  let todayTipsCents = 0;

  for (const r of reservations ?? []) {
    jobsCompleted += 1;
    const rating = Array.isArray(r.rating) ? r.rating[0] : r.rating;
    if (rating) {
      ratingSum += rating.stars;
      ratingCount += 1;
      tipsTotalCents += rating.tipCents ?? 0;
    }
    const relevantDate = r.returnValetId === user.id ? r.returnDateEstimate : r.departureDate;
    const d = new Date(relevantDate);
    if (d >= todayStart && d < todayEnd) {
      todayJobsCompleted += 1;
      todayTipsCents += rating?.tipCents ?? 0;
    }
  }

  return NextResponse.json({
    allTime: {
      jobsCompleted,
      ratingAvg: ratingCount > 0 ? ratingSum / ratingCount : null,
      tipsTotalCents,
    },
    today: {
      jobsCompleted: todayJobsCompleted,
      tipsTotalCents: todayTipsCents,
    },
  });
}
