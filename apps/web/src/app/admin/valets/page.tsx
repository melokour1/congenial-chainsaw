import { createAdminClient } from '@/lib/supabase/admin';
import { ValetsTable } from '@/components/admin/valets-table';
import { ValetAddForm } from '@/components/admin/valet-form';

export const dynamic = 'force-dynamic';

export default async function ValetsPage() {
  const admin = createAdminClient();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [{ data: valets }, { data: todaysReservations }] = await Promise.all([
    admin.from('profiles').select('id, fullName, email, phone, valetStatus, queuePosition').eq('role', 'VALET').order('queuePosition', { ascending: true, nullsFirst: false }),
    admin.from('reservations').select('departureValetId, returnValetId').gte('departureDate', todayStart.toISOString()).lte('departureDate', todayEnd.toISOString()),
  ]);

  const rows = (valets ?? []).map((v) => ({
    ...v,
    todaysJobCount: (todaysReservations ?? []).filter((r) => r.departureValetId === v.id || r.returnValetId === v.id).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Valets</h1>
        <p className="text-sm text-medium-gray">{rows.length} valets on record.</p>
      </div>
      <ValetAddForm />
      <ValetsTable valets={rows as any} />
    </div>
  );
}
