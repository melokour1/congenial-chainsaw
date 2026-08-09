import { createAdminClient } from '@/lib/supabase/admin';
import { CustomersTable, type CustomerRow } from '@/components/admin/customers-table';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const admin = createAdminClient();
  const [{ data: customers }, { data: reservations }, { data: rentals }] = await Promise.all([
    admin.from('profiles').select('id, fullName, email, phone').eq('role', 'CUSTOMER').order('fullName'),
    admin.from('reservations').select('customerId, totalCents'),
    admin.from('rental_bookings').select('customerId, totalCents'),
  ]);

  const byCustomer = new Map<string, { bookingCount: number; lifetimeValueCents: number }>();
  for (const r of [...(reservations ?? []), ...(rentals ?? [])]) {
    const entry = byCustomer.get(r.customerId) ?? { bookingCount: 0, lifetimeValueCents: 0 };
    entry.bookingCount += 1;
    entry.lifetimeValueCents += r.totalCents ?? 0;
    byCustomer.set(r.customerId, entry);
  }

  const rows: CustomerRow[] = (customers ?? []).map((c) => ({
    ...c,
    bookingCount: byCustomer.get(c.id)?.bookingCount ?? 0,
    lifetimeValueCents: byCustomer.get(c.id)?.lifetimeValueCents ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Customers</h1>
        <p className="text-sm text-medium-gray">{rows.length} customers on record.</p>
      </div>
      <CustomersTable customers={rows} />
    </div>
  );
}
