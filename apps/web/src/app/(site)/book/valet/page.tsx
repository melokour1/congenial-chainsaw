import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ValetBookingWizard } from '@/components/site/valet-wizard/valet-booking-wizard';

export const metadata: Metadata = {
  title: 'Book airport valet — LAXValetCare',
};

export default function BookValetPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-content px-4 py-10 text-sm text-medium-gray sm:px-6">Loading…</div>}>
      <ValetBookingWizard />
    </Suspense>
  );
}
