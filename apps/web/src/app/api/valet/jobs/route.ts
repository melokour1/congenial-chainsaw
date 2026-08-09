import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * "My jobs" for the valet app (spec Part 4). RLS on reservations/job_offers only lets a
 * customer read their own rows, so this route uses createAdminClient() after checking the
 * caller is VALET/ADMIN — the cleaner option flagged in the build brief over loosening RLS.
 *
 * Returns:
 *  - pendingOffers: this valet's PENDING job_offers (triggers the 60s accept/decline alarm)
 *  - jobs: reservations assigned to this valet (as departure and/or return valet) whose
 *    departureDate or returnDateEstimate falls within [today 00:00, today+8 days) — the
 *    window the date selector (Today + next 7 days) needs. Client slices/filters by the
 *    selected day and search/filter state.
 */
const RESERVATION_SELECT = `*,
  addOns:reservation_add_ons(*),
  terminal:terminals(*),
  customer:profiles!reservations_customerId_fkey(id, fullName, email, phone),
  departureValet:profiles!reservations_departureValetId_fkey(id, fullName, photoUrl),
  returnValet:profiles!reservations_returnValetId_fkey(id, fullName, photoUrl),
  photos(*),
  activityLogs:activity_logs(*)`;

const OFFER_SELECT = `*, reservation:reservations(id, bookingCode, vehicleColor, vehicleMake, vehicleModel, transmission, plate, terminal:terminals(code), customer:profiles!reservations_customerId_fkey(fullName))`;

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'VALET' && profile.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();

  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const windowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8).toISOString();

  const [{ data: departureJobs, error: depErr }, { data: returnJobs, error: retErr }, { data: pendingOffers, error: offErr }] = await Promise.all([
    admin.from('reservations').select(RESERVATION_SELECT)
      .eq('departureValetId', user.id)
      .gte('departureDate', windowStart).lt('departureDate', windowEnd),
    admin.from('reservations').select(RESERVATION_SELECT)
      .eq('returnValetId', user.id)
      .gte('returnDateEstimate', windowStart).lt('returnDateEstimate', windowEnd),
    admin.from('job_offers').select(OFFER_SELECT)
      .eq('valetId', user.id).eq('response', 'PENDING')
      .order('offeredAt', { ascending: true }),
  ]);

  if (depErr || retErr || offErr) {
    return NextResponse.json({ error: (depErr ?? retErr ?? offErr)?.message }, { status: 500 });
  }

  const byId = new Map<string, any>();
  for (const r of departureJobs ?? []) byId.set(r.id, { ...r, _asDeparture: true });
  for (const r of returnJobs ?? []) byId.set(r.id, { ...(byId.get(r.id) ?? r), ...r, _asReturn: true, _asDeparture: byId.get(r.id)?._asDeparture ?? false });

  return NextResponse.json({ jobs: Array.from(byId.values()), pendingOffers: pendingOffers ?? [] });
}
