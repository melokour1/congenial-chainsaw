'use client';

import type { AddOnType, PricingConfig } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { Button, Card } from '@/components/ui';
import type { ValetWizardData } from './types';

const ADD_ONS: { type: AddOnType; title: string; description: string }[] = [
  { type: 'HAND_WASH', title: 'Hand Wash', description: 'Exterior hand wash while your car is stored.' },
  { type: 'FULL_DETAIL', title: 'Full Detail', description: 'Interior + exterior detail, done curbside-ready.' },
  { type: 'EV_CHARGE', title: 'EV Charge', description: 'Topped off and ready for your next trip.' },
  { type: 'GAS_FILL_UP', title: 'Gas Fill-Up', description: 'Full tank, billed at pump price plus service fee.' },
];

export function StepAddOns({
  data,
  update,
  pricing,
  onNext,
  onBack,
}: {
  data: ValetWizardData;
  update: (patch: Partial<ValetWizardData>) => void;
  pricing: PricingConfig | null;
  onNext: () => void;
  onBack: () => void;
}) {
  function priceLabel(type: AddOnType): string {
    if (!pricing) return '';
    if (type === 'HAND_WASH') return formatCents(pricing.carCare.handWashCents);
    if (type === 'FULL_DETAIL') return formatCents(pricing.carCare.fullDetailCents);
    if (type === 'EV_CHARGE') return formatCents(pricing.carCare.evChargeCents);
    return pricing.carCare.gasFillUpCents != null ? formatCents(pricing.carCare.gasFillUpCents) : 'Ask your valet — not bookable online yet';
  }

  // Gas fill-up has no fixed price (billed at pump price), so it can't be quoted or
  // added to the total here — selecting it would silently add a $0 line item.
  function isDisabled(type: AddOnType): boolean {
    return type === 'GAS_FILL_UP' && pricing?.carCare.gasFillUpCents == null;
  }

  function toggle(type: AddOnType) {
    if (isDisabled(type)) return;
    update({
      addOns: data.addOns.includes(type) ? data.addOns.filter((a) => a !== type) : [...data.addOns, type],
    });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Car care add-ons</h2>
      <p className="mt-1 text-sm text-medium-gray">Optional — skip this step if you don&rsquo;t need any.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ADD_ONS.map((a) => {
          const active = data.addOns.includes(a.type);
          const disabled = isDisabled(a.type);
          return (
            <Card
              key={a.type}
              onClick={() => toggle(a.type)}
              className={`border transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${active ? 'border-black dark:border-white' : 'border-light-gray dark:border-[#2A2A2A]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold">{a.title}</h3>
                  <p className="mt-1 text-xs text-medium-gray">{a.description}</p>
                </div>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                    active ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray dark:border-[#2A2A2A]'
                  }`}
                >
                  {active ? '✓' : ''}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold">{priceLabel(a.type)}</p>
            </Card>
          );
        })}
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
