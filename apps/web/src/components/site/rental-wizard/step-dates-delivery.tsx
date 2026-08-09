'use client';

import type { DeliveryMethod, PricingConfig } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { Button } from '@/components/ui';
import type { RentalWizardData } from './types';

const METHODS: { value: DeliveryMethod; label: string; description: string }[] = [
  { value: 'LOT', label: 'Pick up at our lot', description: 'LAXValetCare Lot A, near LAX' },
  { value: 'LAX', label: 'Deliver to LAX', description: 'We bring it to your terminal' },
  { value: 'HOME', label: 'Deliver to an address', description: 'We bring it to you' },
];

export function StepDatesDelivery({
  data,
  update,
  pricing,
  onNext,
}: {
  data: RentalWizardData;
  update: (patch: Partial<RentalWizardData>) => void;
  pricing: PricingConfig | null;
  onNext: () => void;
}) {
  const canContinue =
    !!data.pickupDate && !!data.returnDate && (data.deliveryMethod !== 'HOME' || !!data.deliveryAddress);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Dates &amp; delivery</h2>
      <p className="mt-1 text-sm text-medium-gray">When do you need the car, and where should we bring it?</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Pickup date &amp; time
          <input
            type="datetime-local"
            value={data.pickupDate}
            onChange={(e) => update({ pickupDate: e.target.value })}
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Return date &amp; time
          <input
            type="datetime-local"
            value={data.returnDate}
            onChange={(e) => update({ returnDate: e.target.value })}
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
            required
          />
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold">Delivery method</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {METHODS.map((m) => {
            const cents = pricing?.rental.deliveryCents[m.value] ?? 0;
            const active = data.deliveryMethod === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => update({ deliveryMethod: m.value })}
                className={`flex flex-col items-start gap-1 rounded-card border p-4 text-left transition-colors ${
                  active ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray hover:border-black dark:border-[#2A2A2A] dark:hover:border-white'
                }`}
              >
                <span className="text-sm font-semibold">{m.label}</span>
                <span className={`text-xs ${active ? 'opacity-80' : 'text-medium-gray'}`}>{m.description}</span>
                <span className="text-xs font-semibold">{cents > 0 ? formatCents(cents) : 'Free'}</span>
              </button>
            );
          })}
        </div>
        {data.deliveryMethod === 'HOME' && (
          <input
            type="text"
            value={data.deliveryAddress}
            onChange={(e) => update({ deliveryAddress: e.target.value })}
            placeholder="Delivery address"
            className="mt-3 min-h-[48px] w-full rounded-card border border-light-gray bg-transparent px-3 text-sm dark:border-[#2A2A2A]"
          />
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="primary" className="h-12 px-8" onClick={onNext} disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
