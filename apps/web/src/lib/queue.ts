import { createAdminClient } from './supabase/admin';

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

/**
 * Fair Queue System (spec Part 5).
 *  - First clocked in = first in queue; back of line after each completed job.
 *  - AVAILABLE valets receive jobs; BUSY/BREAK/OFF are skipped.
 *  - A decline/miss passes to the next valet; if the whole queue declines, it restarts
 *    from #1 and keeps circling until someone accepts. Admins are alerted after each
 *    failed round.
 *  - Return Stage 2 always goes back to whoever accepted Stage 1 (no re-queue) — callers
 *    should pass that valet's id directly instead of calling dispatchNextInQueue.
 *
 * The 60-second accept/decline countdown is enforced client-side by the valet app (it
 * shows the alarm and calls respondToOffer(..., 'EXPIRED') itself if the timer runs out).
 * A production deploy should back this with a server-side sweep too — see docs/HANDOFF.md.
 */

export async function dispatchNextInQueue(
  supabase: SupabaseAdmin,
  params: { reservationId: string; jobType: 'DEPARTURE' | 'RETURN_STAGE1' | 'RETURN_STAGE2'; excludeValetIds?: string[]; roundNumber?: number },
): Promise<{ valetId: string; offerId: string } | null> {
  const { data: valets } = await supabase
    .from('profiles')
    .select('id, queuePosition')
    .eq('role', 'VALET')
    .eq('valetStatus', 'AVAILABLE')
    .not('id', 'in', `(${(params.excludeValetIds ?? ['__none__']).join(',')})`)
    .order('queuePosition', { ascending: true, nullsFirst: false })
    .limit(1);

  const next = valets?.[0];
  if (!next) return null;

  const offerId = crypto.randomUUID();
  await supabase.from('job_offers').insert({
    id: offerId,
    reservationId: params.reservationId,
    valetId: next.id,
    jobType: params.jobType,
    response: 'PENDING',
    roundNumber: params.roundNumber ?? 1,
  });

  return { valetId: next.id, offerId };
}

export async function respondToOffer(
  supabase: SupabaseAdmin,
  offerId: string,
  response: 'ACCEPTED' | 'DECLINED' | 'EXPIRED',
): Promise<{ status: 'ACCEPTED' } | { status: 'REDISPATCHED'; valetId: string } | { status: 'ROUND_EXHAUSTED' }> {
  const { data: offer } = await supabase.from('job_offers').select('*').eq('id', offerId).single();
  if (!offer) throw new Error('offer not found');

  await supabase.from('job_offers').update({ response, respondedAt: new Date().toISOString() }).eq('id', offerId);

  if (response === 'ACCEPTED') {
    const valetField = offer.jobType === 'DEPARTURE' ? 'departureValetId' : 'returnValetId';
    if (offer.reservationId) {
      await supabase.from('reservations').update({ [valetField]: offer.valetId }).eq('id', offer.reservationId);
      await supabase.from('activity_logs').insert({
        id: crypto.randomUUID(), reservationId: offer.reservationId, actorId: offer.valetId,
        action: `Accepted ${offer.jobType} job`, detail: { offerId },
      });
    }
    await supabase.from('profiles').update({ valetStatus: 'BUSY' }).eq('id', offer.valetId);
    return { status: 'ACCEPTED' };
  }

  // declined or expired — find prior offers this round to build the exclude list
  const { data: roundOffers } = await supabase
    .from('job_offers')
    .select('valetId')
    .eq('reservationId', offer.reservationId)
    .eq('jobType', offer.jobType)
    .eq('roundNumber', offer.roundNumber);
  const excludeValetIds = (roundOffers ?? []).map((o) => o.valetId);

  const redispatched = await dispatchNextInQueue(supabase, {
    reservationId: offer.reservationId,
    jobType: offer.jobType,
    excludeValetIds,
    roundNumber: offer.roundNumber,
  });
  if (redispatched) return { status: 'REDISPATCHED', valetId: redispatched.valetId };

  // whole queue has now declined/missed this round — restart from #1, bump round, alert admins
  const retry = await dispatchNextInQueue(supabase, {
    reservationId: offer.reservationId,
    jobType: offer.jobType,
    excludeValetIds: [],
    roundNumber: offer.roundNumber + 1,
  });
  await alertAdmins(supabase, `Queue cycled with no acceptance for ${offer.jobType} job (reservation ${offer.reservationId}) — round ${offer.roundNumber + 1} restarting.`);
  return retry ? { status: 'REDISPATCHED', valetId: retry.valetId } : { status: 'ROUND_EXHAUSTED' };
}

/** Valet completes a job → back of the line, AVAILABLE again. */
export async function returnValetToBackOfQueue(supabase: SupabaseAdmin, valetId: string): Promise<void> {
  const { data: max } = await supabase
    .from('profiles')
    .select('queuePosition')
    .eq('role', 'VALET')
    .order('queuePosition', { ascending: false, nullsFirst: false })
    .limit(1)
    .single();
  const nextPosition = (max?.queuePosition ?? 0) + 1;
  await supabase.from('profiles').update({ valetStatus: 'AVAILABLE', queuePosition: nextPosition }).eq('id', valetId);
}

async function alertAdmins(supabase: SupabaseAdmin, message: string): Promise<void> {
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'ADMIN');
  for (const admin of admins ?? []) {
    await supabase.from('notifications').insert({
      id: crypto.randomUUID(), profileId: admin.id, title: 'Queue alert', body: message, type: 'QUEUE_ALERT', sentVia: ['IN_APP'],
    });
  }
}
