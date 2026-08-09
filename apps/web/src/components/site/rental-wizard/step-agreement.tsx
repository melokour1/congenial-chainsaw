'use client';

import { Button, Card } from '@/components/ui';
import { SignaturePad } from '@/components/site/signature-pad';
import { formatDate } from '@/components/site/lib/format';
import type { FleetVehicleRow, RentalWizardData } from './types';

export function StepAgreement({
  data,
  update,
  vehicle,
  bookingCode,
  bookingId,
  onNext,
  onBack,
}: {
  data: RentalWizardData;
  update: (patch: Partial<RentalWizardData>) => void;
  vehicle: FleetVehicleRow | null;
  bookingCode: string | null;
  bookingId: string | null;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = data.agreementChecked && !!data.signatureUrl;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Rental agreement</h2>
      <p className="mt-1 text-sm text-medium-gray">Please review the terms below and sign to continue.</p>

      <Card className="mt-6 max-h-72 overflow-y-auto border border-light-gray text-sm leading-relaxed text-medium-gray dark:border-[#2A2A2A]">
        <h3 className="font-display text-base font-bold text-black dark:text-white">LAXValetCare Vehicle Rental Agreement</h3>
        <p className="mt-2">
          This Rental Agreement (&ldquo;Agreement&rdquo;) is entered into between LAXValetCare (&ldquo;Company&rdquo;) and the
          renter identified on booking {bookingCode ?? '—'} (&ldquo;Renter&rdquo;) for the vehicle
          {vehicle ? ` ${vehicle.year} ${vehicle.make} ${vehicle.model}` : ''}, pickup {formatDate(data.pickupDate ? new Date(data.pickupDate).toISOString() : null)}
          , return {formatDate(data.returnDate ? new Date(data.returnDate).toISOString() : null)}.
        </p>
        <p className="mt-2">
          <strong className="text-black dark:text-white">1. Condition &amp; Use.</strong> Renter accepts the vehicle in its
          condition as documented at pickup and agrees to return it in the same condition, ordinary wear excepted. The
          vehicle may only be operated by the Renter and any approved additional drivers listed on this booking, and only
          for lawful purposes within the continental United States unless otherwise agreed in writing.
        </p>
        <p className="mt-2">
          <strong className="text-black dark:text-white">2. Insurance.</strong> Renter must maintain valid insurance
          coverage for the duration of the rental, either through their own policy or a LAXValetCare protection plan.
          Coverage is subject to review and approval by LAXValetCare before pickup; no rental is released without
          approved insurance on file.
        </p>
        <p className="mt-2">
          <strong className="text-black dark:text-white">3. Fuel &amp; Mileage.</strong> The vehicle should be returned
          with the same fuel level as at pickup. Excess mileage, smoking, and unreasonable wear may incur additional
          charges disclosed in the LAXValetCare pricing schedule.
        </p>
        <p className="mt-2">
          <strong className="text-black dark:text-white">4. Late Returns.</strong> Vehicles not returned by the scheduled
          return time are subject to hourly and daily late fees, and may be reported after 72 hours per LAXValetCare&rsquo;s
          overdue vehicle policy.
        </p>
        <p className="mt-2">
          <strong className="text-black dark:text-white">5. Liability.</strong> Renter is responsible for any damage,
          loss, or theft occurring during the rental period not covered by approved insurance, up to the vehicle&rsquo;s
          fair market value, subject to the security deposit held at pickup.
        </p>
        <p className="mt-2">
          <strong className="text-black dark:text-white">6. Signature.</strong> By checking the box and signing below,
          Renter acknowledges having read, understood, and agreed to the full terms of this Agreement.
        </p>
      </Card>

      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.agreementChecked}
          onChange={(e) => update({ agreementChecked: e.target.checked })}
          className="mt-0.5 h-5 w-5 rounded border-light-gray"
        />
        I have read and agree to the LAXValetCare Vehicle Rental Agreement.
      </label>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold">Sign below</p>
        <SignaturePad rentalBookingId={bookingId ?? undefined} onSigned={(url) => update({ signatureUrl: url })} />
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" className="h-12 px-8" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" className="h-12 px-8" onClick={onNext} disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
