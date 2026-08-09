import { createAdminClient } from '@/lib/supabase/admin';
import { FleetTable } from '@/components/admin/fleet-table';
import { FleetAddForm } from '@/components/admin/fleet-form';

export const dynamic = 'force-dynamic';

export default async function FleetPage() {
  const admin = createAdminClient();
  const { data } = await admin.from('fleet_vehicles').select('*').order('make');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Fleet</h1>
        <p className="text-sm text-medium-gray">{data?.length ?? 0} vehicles in inventory.</p>
      </div>
      <FleetAddForm />
      <FleetTable vehicles={(data ?? []) as any} />
    </div>
  );
}
