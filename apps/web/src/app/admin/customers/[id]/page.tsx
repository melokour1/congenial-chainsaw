import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { CustomerDetail } from '@/components/admin/customer-detail';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const [{ data: customer }, { data: reservations }, { data: rentals }, { data: verification }, { data: chatThreads }] = await Promise.all([
    admin.from('profiles').select('id, fullName, email, phone, createdAt').eq('id', params.id).eq('role', 'CUSTOMER').single(),
    admin.from('reservations').select('id, bookingCode, status, totalCents, departureDate').eq('customerId', params.id).order('departureDate', { ascending: false }),
    admin.from('rental_bookings').select('id, bookingCode, status, totalCents, pickupDate').eq('customerId', params.id).order('pickupDate', { ascending: false }),
    admin.from('rental_verifications').select('*').eq('customerId', params.id).maybeSingle(),
    admin.from('chat_threads').select('id, status, lastMessageAt').eq('customerId', params.id).order('lastMessageAt', { ascending: false }),
  ]);

  if (!customer) notFound();

  const bookings = [
    ...(reservations ?? []).map((r) => ({ id: r.id, bookingCode: r.bookingCode, status: r.status, totalCents: r.totalCents, date: r.departureDate, kind: 'Valet' as const })),
    ...(rentals ?? []).map((r) => ({ id: r.id, bookingCode: r.bookingCode, status: r.status, totalCents: r.totalCents, date: r.pickupDate, kind: 'Rental' as const })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return <CustomerDetail customer={customer as any} bookings={bookings} verification={verification as any} chatThreads={(chatThreads ?? []) as any} />;
}
