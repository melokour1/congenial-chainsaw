import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  return profile?.role === 'ADMIN' ? user : null;
}

/** Admin > Fleet — add a vehicle. */
export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json();
  const admin = createAdminClient();
  const id = crypto.randomUUID();
  const { error } = await admin.from('fleet_vehicles').insert({
    id,
    class: body.class,
    make: body.make,
    model: body.model,
    year: Number(body.year),
    color: body.color,
    plate: body.plate,
    dailyRateCents: Number(body.dailyRateCents),
    photos: body.photos ?? [],
    status: body.status ?? 'AVAILABLE',
    mileage: Number(body.mileage ?? 0),
    location: body.location ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id }, { status: 201 });
}
