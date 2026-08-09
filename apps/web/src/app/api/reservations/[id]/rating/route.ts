import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Screen 2 of the post-delivery flow (spec 1.11) — stars + optional comment; tip was already captured on Screen 1. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { stars, comment, tipCents } = (await request.json()) as { stars: number; comment?: string; tipCents?: number };
  const admin = createAdminClient();
  const { error } = await admin.from('ratings').upsert(
    { id: crypto.randomUUID(), reservationId: params.id, stars, comment: comment ?? null, tipCents: tipCents ?? 0 },
    { onConflict: 'reservationId' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (tipCents) await admin.from('reservations').update({ gratuityCents: tipCents }).eq('id', params.id);

  return NextResponse.json({ ok: true });
}
