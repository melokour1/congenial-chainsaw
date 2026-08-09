import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { ValetDetail } from '@/components/admin/valet-detail';

export const dynamic = 'force-dynamic';

export default async function ValetDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data: valet } = await admin.from('profiles').select('id, fullName, email, phone, valetStatus, queuePosition, clockedInAt').eq('id', params.id).eq('role', 'VALET').single();
  if (!valet) notFound();

  const { data: jobs } = await admin
    .from('reservations')
    .select('id, rating:ratings(stars, tipCents)')
    .or(`departureValetId.eq.${params.id},returnValetId.eq.${params.id}`);

  const jobCount = jobs?.length ?? 0;
  const ratings = (jobs ?? []).map((j: any) => j.rating).filter(Boolean).flat();
  const avgRating = ratings.length ? ratings.reduce((s: number, r: any) => s + r.stars, 0) / ratings.length : null;
  const totalTips = ratings.reduce((s: number, r: any) => s + (r.tipCents ?? 0), 0);

  return <ValetDetail valet={valet as any} perf={{ jobCount, avgRating, totalTips }} />;
}
