'use client';

import type { PricingConfig, ServiceTier } from '@laxvaletcare/shared';
import { formatCents } from '@laxvaletcare/shared';
import { Button, Card } from '@/components/ui';
import type { ValetWizardData } from './types';

const TIERS: { tier: ServiceTier; title: string; description: string }[] = [
  { tier: 'STANDARD', title: 'Standard', description: 'Indoor storage, real-time tracking, curbside handoff.' },
  { tier: 'VIP_EXPRESS', title: 'VIP Express', description: 'Priority pickup and delivery — first in line, every time.' },
  { tier: 'VIP_ELITE', title: 'VIP Elite', description: 'White-glove service: dedicated valet, priority everything.' },
];

export function StepServiceTier({
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
  function tierPriceLabel(tier: ServiceTier): string {
    if (!pricing) return '';
    if (tier === 'STANDARD') return `${formatCents(pricing.valet.standardPerDayCents)}/day`;
    if (tier === 'VIP_EXPRESS') return `+${formatCents(pricing.valet.vipExpressPerPersonCents)}/person`;
    return `+${formatCents(pricing.valet.vipElitePerPersonCents)}/person`;
  }

  const isVip = data.serviceTier !== 'STANDARD';

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Choose your service tier</h2>
      <p className="mt-1 text-sm text-medium-gray">Standard valet is included with every booking.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TIERS.map((t) => {
          const active = data.serviceTier === t.tier;
          return (
            <Card
              key={t.tier}
              onClick={() => update({ serviceTier: t.tier })}
              className={`cursor-pointer border transition-colors ${
                active ? 'border-black dark:border-white' : 'border-light-gray dark:border-[#2A2A2A]'
              }`}
            >
              <h3 className="font-display text-lg font-bold">{t.title}</h3>
              <p className="mt-1 text-sm font-semibold">{tierPriceLabel(t.tier)}</p>
              <p className="mt-2 text-xs text-medium-gray">{t.description}</p>
            </Card>
          );
        })}
      </div>

      {isVip && (
        <label className="mt-6 flex max-w-xs flex-col gap-1 text-sm font-semibold">
          Number of people
          <input
            type="number"
            min={1}
            value={data.vipPersonCount}
            onChange={(e) => update({ vipPersonCount: Math.max(1, Number(e.target.value) || 1) })}
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
          />
        </label>
      )}

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
