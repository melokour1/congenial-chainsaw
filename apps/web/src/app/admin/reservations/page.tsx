import { createAdminClient } from '@/lib/supabase/admin';
import { ReservationsTable } from '@/components/admin/reservations-table';

export const dynamic = 'force-dynamic';

export default async function AdminReservationsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('reservations')
    .select('id, bookingCode, status, departureDate, returnDateEstimate, vehicleMake, vehicleModel, totalCents, customer:profiles!reservations_customerId_fkey(fullName), terminal:terminals(code, name)')
    .order('departureDate', { ascending: false })
    .limit(1000);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Reservations</h1>
        <p className="text-sm text-medium-gray">All valet reservations — search, filter, and manage.</p>
      </div>
      <ReservationsTable reservations={(data ?? []) as any} />
    </div>
  );
}
