import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { FleetVehicleDetail } from '@/components/admin/fleet-vehicle-detail';

export const dynamic = 'force-dynamic';

export default async function FleetVehicleDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const [{ data: vehicle }, { data: history }] = await Promise.all([
    admin.from('fleet_vehicles').select('*').eq('id', params.id).single(),
    admin.from('rental_bookings').select('id, bookingCode, status, pickupDate, returnDate, totalCents, customer:profiles!rental_bookings_customerId_fkey(fullName)').eq('fleetVehicleId', params.id).order('pickupDate', { ascending: false }),
  ]);

  if (!vehicle) notFound();

  return <FleetVehicleDetail vehicle={vehicle as any} history={(history ?? []) as any} />;
}
