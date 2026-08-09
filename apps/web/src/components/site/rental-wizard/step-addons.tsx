'use client';

import { Button, Card } from '@/components/ui';
import { EXTRA_DRIVER_CENTS_PER_DAY, CHILD_SEAT_CENTS_PER_DAY, type RentalWizardData } from './types';

export function StepAddOns({
  data,
  update,
  onNext,
  onBack,
}: {
  data: RentalWizardData;
  update: (patch: Partial<RentalWizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Add-ons</h2>
      <p className="mt-1 text-sm text-medium-gray">Optional extras for your rental.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          onClick={() => update({ extraDriver: !data.extraDriver })}
          className={`cursor-pointer border transition-colors ${data.extraDriver ? 'border-black dark:border-white' : 'border-light-gray dark:border-[#2A2A2A]'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold">Extra driver</h3>
              <p className="mt-1 text-xs text-medium-gray">Add a second approved driver to this rental.</p>
            </div>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${data.extraDriver ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray dark:border-[#2A2A2A]'}`}>
              {data.extraDriver ? '✓' : ''}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold">${EXTRA_DRIVER_CENTS_PER_DAY / 100}/day</p>
        </Card>
        <Card
          onClick={() => update({ childSeat: !data.childSeat })}
          className={`cursor-pointer border transition-colors ${data.childSeat ? 'border-black dark:border-white' : 'border-light-gray dark:border-[#2A2A2A]'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold">Child seat</h3>
              <p className="mt-1 text-xs text-medium-gray">A properly installed child seat, ready at pickup.</p>
            </div>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${data.childSeat ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray dark:border-[#2A2A2A]'}`}>
              {data.childSeat ? '✓' : ''}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold">${CHILD_SEAT_CENTS_PER_DAY / 100}/day</p>
        </Card>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" className="h-12 px-8" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" className="h-12 px-8" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
