import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatCents } from '@laxvaletcare/shared';
import { Card, StatusBadge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?next=/account/activity');

  const supabase = await createClient();
  const [{ data: reservations }, { data: rentals }] = await Promise.all([
    supabase.from('reservations').select('*').eq('customerId', profile.id).order('createdAt', { ascending: false }),
    supabase.from('rental_bookings').select('*, fleetVehicle:fleet_vehicles(*)').eq('customerId', profile.id).order('createdAt', { ascending: false }),
  ]);

  const hasAny = (reservations?.length ?? 0) > 0 || (rentals?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold">My activity</h1>
      <p className="mt-2 text-medium-gray">Your valet bookings and rentals.</p>

      {!hasAny && (
        <p className="mt-10 text-sm text-medium-gray">
          Nothing here yet — book a <Link href="/book/valet" className="underline">valet</Link> or{' '}
          <Link href="/book/rent" className="underline">rental</Link> to see it here.
        </p>
      )}

      {(reservations?.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold">Valet bookings</h2>
          <div className="mt-4 flex flex-col gap-3">
            {reservations!.map((r: any) => (
              <Card key={r.id} className="border border-light-gray dark:border-[#2A2A2A]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.bookingCode}</div>
                    <div className="text-sm text-medium-gray">
                      {r.vehicleMake} {r.vehicleModel} — {new Date(r.departureDate).toLocaleDateString()} to{' '}
                      {new Date(r.returnDateEstimate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={r.status} />
                    <span className="text-sm font-medium">{formatCents(r.totalCents)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {(rentals?.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold">Rentals</h2>
          <div className="mt-4 flex flex-col gap-3">
            {rentals!.map((r: any) => (
              <Card key={r.id} className="border border-light-gray dark:border-[#2A2A2A]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.bookingCode}</div>
                    <div className="text-sm text-medium-gray">
                      {r.fleetVehicle?.make} {r.fleetVehicle?.model} — {new Date(r.pickupDate).toLocaleDateString()} to{' '}
                      {new Date(r.returnDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={r.status} />
                    <span className="text-sm font-medium">{formatCents(r.totalCents)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
