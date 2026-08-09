import { createAdminClient } from '@/lib/supabase/admin';
import { InsuranceReviewList } from '@/components/admin/insurance-review-list';

export const dynamic = 'force-dynamic';

export default async function InsuranceReviewsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('rental_bookings')
    .select('id, bookingCode, pickupDate, insuranceOption, insurancePlan, insuranceCompany, insurancePolicyNumber, insuranceCardFrontUrl, insuranceCardBackUrl, customer:profiles!rental_bookings_customerId_fkey(id, fullName, email, phone), fleetVehicle:fleet_vehicles(make, model, year)')
    .eq('insuranceStatus', 'PENDING')
    .order('pickupDate', { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Insurance Reviews</h1>
        <p className="text-sm text-medium-gray">Pending rental insurance submissions, sorted by soonest pickup.</p>
      </div>
      <InsuranceReviewList rentals={(data ?? []) as any} />
    </div>
  );
}
