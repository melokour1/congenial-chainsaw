import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatCents } from '@laxvaletcare/shared';
import { Card, StatusBadge } from '@/components/ui';
import { StatTile } from '@/components/admin/stat-tile';

export const dynamic = 'force-dynamic';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient();
  const todayStart = startOfToday().toISOString();
  const todayEnd = endOfToday().toISOString();

  const [
    { data: departuresToday },
    { data: returnsToday },
    { data: liveReservations },
    { data: closedToday },
    { data: valets },
    { data: pendingInsurance },
    { data: recentActivity },
    { data: recentAlerts },
  ] = await Promise.all([
    admin.from('reservations').select('id', { count: 'exact', head: false }).gte('departureDate', todayStart).lte('departureDate', todayEnd),
    admin.from('reservations').select('id', { count: 'exact', head: false }).gte('returnDateEstimate', todayStart).lte('returnDateEstimate', todayEnd),
    admin.from('reservations').select('id, status').in('status', ['LIVE', 'CHECKED_IN', 'IN_TRIP', 'RETURN_REQUESTED', 'DELIVERING']),
    admin.from('reservations').select('totalCents').eq('status', 'CLOSED').gte('updatedAt', todayStart).lte('updatedAt', todayEnd),
    admin.from('profiles').select('id, fullName, valetStatus, queuePosition, photoUrl').eq('role', 'VALET').order('queuePosition', { ascending: true, nullsFirst: false }),
    admin.from('rental_bookings').select('id, bookingCode, pickupDate').eq('insuranceStatus', 'PENDING').order('pickupDate', { ascending: true }),
    admin.from('activity_logs').select('id, action, detail, createdAt, actor:profiles(fullName)').order('createdAt', { ascending: false }).limit(15),
    admin.from('notifications').select('id, title, body, type, createdAt').in('type', ['QUEUE_ALERT', 'OVERDUE_ALERT', 'RENTAL_INSURANCE_REJECTED']).order('createdAt', { ascending: false }).limit(10),
  ]);

  const revenueToday = (closedToday ?? []).reduce((sum, r) => sum + (r.totalCents ?? 0), 0);
  const now = Date.now();
  const urgentInsuranceCount = (pendingInsurance ?? []).filter((r) => new Date(r.pickupDate).getTime() - now < 6 * 60 * 60 * 1000).length;

  // current job per valet, cheaply, from active reservations
  const valetIds = (valets ?? []).map((v) => v.id);
  const { data: activeJobs } = valetIds.length
    ? await admin.from('reservations').select('id, bookingCode, status, departureValetId, returnValetId').in('status', ['CHECKED_IN', 'IN_TRIP', 'RETURN_REQUESTED', 'DELIVERING']).or(`departureValetId.in.(${valetIds.join(',')}),returnValetId.in.(${valetIds.join(',')})`)
    : { data: [] };

  function jobFor(valetId: string) {
    return (activeJobs ?? []).find((j) => j.departureValetId === valetId || j.returnValetId === valetId);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-medium-gray">Live overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Departures today" value={departuresToday?.length ?? 0} />
        <StatTile label="Returns today" value={returnsToday?.length ?? 0} />
        <StatTile label="🔴 Live now" value={liveReservations?.length ?? 0} />
        <StatTile label="Revenue today" value={formatCents(revenueToday)} accent />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Live valet queue</h2>
            <Link href="/admin/valets" className="text-xs font-medium text-medium-gray hover:text-white">View all →</Link>
          </div>
          <div className="flex flex-col divide-y divide-light-gray/10">
            {(valets ?? []).length === 0 && <p className="py-4 text-sm text-medium-gray">No valets on record.</p>}
            {(valets ?? []).map((v) => {
              const job = jobFor(v.id);
              return (
                <div key={v.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
                      {v.queuePosition ?? '–'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white">{v.fullName}</div>
                      <div className="text-xs text-medium-gray">{job ? `Job: ${job.bookingCode}` : 'No active job'}</div>
                    </div>
                  </div>
                  <StatusBadge status={v.valetStatus ?? 'OFF'} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Insurance reviews</h2>
            <Link href="/admin/insurance-reviews" className="text-xs font-medium text-medium-gray hover:text-white">View all →</Link>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="font-display text-4xl font-bold text-white">{pendingInsurance?.length ?? 0}</span>
            <span className="text-sm text-medium-gray">pending review</span>
            {urgentInsuranceCount > 0 && (
              <span className="mt-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
                ⚠️ {urgentInsuranceCount} pickup{urgentInsuranceCount === 1 ? '' : 's'} within 6 hrs
              </span>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Today&apos;s alerts</h2>
          <div className="flex flex-col gap-3">
            {(recentAlerts ?? []).length === 0 && <p className="text-sm text-medium-gray">No alerts.</p>}
            {(recentAlerts ?? []).map((n) => (
              <div key={n.id} className="rounded-card bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{n.title}</span>
                  <span className="text-xs text-medium-gray">{new Date(n.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-medium-gray">{n.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Recent activity</h2>
          <div className="flex flex-col gap-3">
            {(recentActivity ?? []).length === 0 && <p className="text-sm text-medium-gray">No activity yet.</p>}
            {(recentActivity ?? []).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-white">{a.action}{a.actor?.fullName ? ` — ${a.actor.fullName}` : ''}</span>
                <span className="text-xs text-medium-gray">{new Date(a.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
