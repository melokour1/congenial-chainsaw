import type { Metadata } from 'next';
import { RentalBookingWizard } from '@/components/site/rental-wizard/rental-booking-wizard';

export const metadata: Metadata = {
  title: 'Rent a vehicle — LAXValetCare',
};

export default function BookRentPage() {
  return <RentalBookingWizard />;
}
