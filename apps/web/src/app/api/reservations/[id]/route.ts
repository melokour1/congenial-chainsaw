import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const FULL_SELECT = '*, addOns:reservation_add_ons(*), terminal:terminals(*), customer:profiles!reservations_customerId_fkey(id, fullName, email, phone), departureValet:profiles!reservations_departureValetId_fkey(id, fullName, photoUrl), returnValet:profiles!reservations_returnValetId_fkey(id, fullName, photoUrl), photos(*), activityLogs:activity_logs(*), rating:ratings(*)';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const admin = createAdminClient();
  const client = profile?.role === 'ADMIN' || profile?.role === 'VALET' ? admin : supabase;

  const { data, error } = await client.from('reservations').select(FULL_SELECT).eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

/** Admin edit — any field in the Reservations detail view (vehicle info, assigned valet, notes, etc.) */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'VALET')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const patch = await request.json();
  const admin = createAdminClient();
  const { error } = await admin.from('reservations').update({ ...patch, updatedAt: new Date().toISOString() }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from('activity_logs').insert({
    id: crypto.randomUUID(), reservationId: params.id, actorId: user!.id, action: 'Edited booking', detail: patch,
  });

  return NextResponse.json({ ok: true });
}
