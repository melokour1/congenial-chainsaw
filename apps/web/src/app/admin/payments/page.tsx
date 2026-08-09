import { createAdminClient } from '@/lib/supabase/admin';
import { PaymentsView, type PaymentRow } from '@/components/admin/payments-view';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const admin = createAdminClient();
  const [{ data: reservations }, { data: rentals }] = await Promise.all([
    admin.from('reservations').select('id, bookingCode, status, totalCents, stripePaymentIntentId, createdAt, customer:profiles!reservations_customerId_fkey(fullName)').order('createdAt', { ascending: false }).limit(500),
    admin.from('rental_bookings').select('id, bookingCode, status, totalCents, depositHoldCents, stripePaymentIntentId, createdAt, customer:profiles!rental_bookings_customerId_fkey(fullName)').order('createdAt', { ascending: false }).limit(500),
  ]);

  const rows: PaymentRow[] = [
    ...(reservations ?? []).map((r: any) => ({
      id: r.id, kind: 'RESERVATION' as const, bookingCode: r.bookingCode, status: r.status, totalCents: r.totalCents,
      stripePaymentIntentId: r.stripePaymentIntentId, createdAt: r.createdAt, customerName: r.customer?.fullName ?? '—',
    })),
    ...(rentals ?? []).map((r: any) => ({
      id: r.id, kind: 'RENTAL' as const, bookingCode: r.bookingCode, status: r.status, totalCents: r.totalCents,
      stripePaymentIntentId: r.stripePaymentIntentId, createdAt: r.createdAt, customerName: r.customer?.fullName ?? '—',
      depositHoldCents: r.depositHoldCents,
    })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Payments</h1>
        <p className="text-sm text-medium-gray">Revenue, refunds, and deposit management across valet and rental bookings.</p>
      </div>
      <PaymentsView rows={rows} />
    </div>
  );
}
