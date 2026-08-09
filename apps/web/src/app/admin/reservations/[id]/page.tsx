import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { ReservationDetail } from '@/components/admin/reservation-detail';

export const dynamic = 'force-dynamic';

const FULL_SELECT = `*,
  addOns:reservation_add_ons(*),
  terminal:terminals(*),
  customer:profiles!reservations_customerId_fkey(id, fullName, email, phone),
  departureValet:profiles!reservations_departureValetId_fkey(id, fullName, photoUrl),
  returnValet:profiles!reservations_returnValetId_fkey(id, fullName, photoUrl),
  photos(*, takenByValet:profiles!photos_takenByValetId_fkey(fullName)),
  activityLogs:activity_logs(*, actor:profiles(fullName)),
  rating:ratings(*)`;

export default async function AdminReservationDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const [{ data: reservation }, { data: valets }] = await Promise.all([
    admin.from('reservations').select(FULL_SELECT).eq('id', params.id).single(),
    admin.from('profiles').select('id, fullName, valetStatus').eq('role', 'VALET').order('fullName'),
  ]);

  if (!reservation) notFound();

  return <ReservationDetail reservation={reservation as any} valets={(valets ?? []) as any} />;
}
