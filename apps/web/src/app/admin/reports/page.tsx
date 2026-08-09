import { createAdminClient } from '@/lib/supabase/admin';
import { ReportsView, type ReportsData } from '@/components/admin/reports-view';

export const dynamic = 'force-dynamic';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayKey(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function ReportsPage() {
  const admin = createAdminClient();

  const [{ data: reservations }, { data: addOns }, { data: valets }, { data: customers }] = await Promise.all([
    admin.from('reservations').select('id, customerId, serviceTier, totalCents, status, departureDate, departureValetId, returnValetId, terminal:terminals(name), rating:ratings(stars, tipCents), customer:profiles!reservations_customerId_fkey(fullName)').order('departureDate', { ascending: false }).limit(2000),
    admin.from('reservation_add_ons').select('type'),
    admin.from('profiles').select('id, fullName').eq('role', 'VALET'),
    admin.from('profiles').select('id').eq('role', 'CUSTOMER'),
  ]);

  const rows = reservations ?? [];
  const closedRows = rows.filter((r) => r.status === 'CLOSED');

  // revenue / volume by day (last 14 distinct days present in data)
  const revenueMap = new Map<string, number>();
  const volumeMap = new Map<string, number>();
  for (const r of closedRows) revenueMap.set(dayKey(r.departureDate), (revenueMap.get(dayKey(r.departureDate)) ?? 0) + r.totalCents);
  for (const r of rows) volumeMap.set(dayKey(r.departureDate), (volumeMap.get(dayKey(r.departureDate)) ?? 0) + 1);
  const revenueByDay = Array.from(revenueMap.entries()).slice(-14);
  const volumeByDay = Array.from(volumeMap.entries()).slice(-14);

  // service tier breakdown
  const tierMap = new Map<string, number>();
  for (const r of rows) tierMap.set(r.serviceTier, (tierMap.get(r.serviceTier) ?? 0) + 1);
  const serviceTier = Array.from(tierMap.entries());

  // add-on popularity
  const addOnMap = new Map<string, number>();
  for (const a of addOns ?? []) addOnMap.set(a.type, (addOnMap.get(a.type) ?? 0) + 1);
  const addOnPopularity = Array.from(addOnMap.entries()).sort((a, b) => b[1] - a[1]);

  // repeat customer rate
  const bookingsByCustomer = new Map<string, number>();
  for (const r of rows) bookingsByCustomer.set(r.customerId, (bookingsByCustomer.get(r.customerId) ?? 0) + 1);
  const totalCustomersWithBookings = bookingsByCustomer.size;
  const repeatCustomers = Array.from(bookingsByCustomer.values()).filter((c) => c > 1).length;
  const repeatCustomerRatePct = totalCustomersWithBookings > 0 ? (repeatCustomers / totalCustomersWithBookings) * 100 : 0;

  // top customers by LTV
  const ltvByCustomer = new Map<string, { name: string; ltv: number }>();
  for (const r of rows) {
    const entry = ltvByCustomer.get(r.customerId) ?? { name: (r as any).customer?.fullName ?? 'Unknown', ltv: 0 };
    entry.ltv += r.totalCents;
    ltvByCustomer.set(r.customerId, entry);
  }
  const topCustomers = Array.from(ltvByCustomer.values()).sort((a, b) => b.ltv - a.ltv).slice(0, 10);

  // valet performance
  const valetPerformance = (valets ?? []).map((v) => {
    const jobs = rows.filter((r) => r.departureValetId === v.id || r.returnValetId === v.id);
    const ratings = jobs.map((j) => (j as any).rating).filter(Boolean).flat();
    const avgRating = ratings.length ? ratings.reduce((s: number, r: any) => s + r.stars, 0) / ratings.length : null;
    const tips = ratings.reduce((s: number, r: any) => s + (r.tipCents ?? 0), 0);
    return { name: v.fullName, jobs: jobs.length, avgRating, tips };
  }).sort((a, b) => b.jobs - a.jobs);

  // terminal popularity
  const terminalMap = new Map<string, number>();
  for (const r of rows) {
    const name = (r as any).terminal?.name;
    if (name) terminalMap.set(name, (terminalMap.get(name) ?? 0) + 1);
  }
  const terminalPopularity = Array.from(terminalMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // day of week distribution
  const dowMap = new Map<string, number>(DOW.map((d) => [d, 0]));
  for (const r of rows) {
    const day = DOW[new Date(r.departureDate).getDay()];
    dowMap.set(day, (dowMap.get(day) ?? 0) + 1);
  }
  const dayOfWeek = DOW.map((d) => [d, dowMap.get(d) ?? 0] as [string, number]);

  const data: ReportsData = {
    revenueByDay, volumeByDay, serviceTier, addOnPopularity, repeatCustomerRatePct, topCustomers,
    valetPerformance, terminalPopularity, dayOfWeek,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-medium-gray">Aggregated performance across the last {rows.length} reservations{customers?.length ? ` and ${customers.length} customers` : ''}.</p>
      </div>
      <ReportsView data={data} />
    </div>
  );
}
