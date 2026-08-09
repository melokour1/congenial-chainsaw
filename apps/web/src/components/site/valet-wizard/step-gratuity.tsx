'use client';

import { Button } from '@/components/ui';
import type { ValetWizardData } from './types';

const PRESETS = [1000, 2000, 3000];

export function StepGratuity({
  data,
  update,
  onNext,
  onBack,
}: {
  data: ValetWizardData;
  update: (patch: Partial<ValetWizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isCustom = !PRESETS.includes(data.gratuityCents) && data.gratuityCents > 0;
  const isNone = data.gratuityCents === 0 && !isCustom;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Add a gratuity?</h2>
      <p className="mt-1 text-sm text-medium-gray">100% goes to your valet. Entirely optional.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {PRESETS.map((cents) => (
          <button
            key={cents}
            type="button"
            onClick={() => update({ gratuityCents: cents, gratuityCustom: '' })}
            className={`min-h-[48px] rounded-card border px-6 text-sm font-semibold transition-colors ${
              data.gratuityCents === cents && !isCustom
                ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-light-gray hover:border-black dark:border-[#2A2A2A] dark:hover:border-white'
            }`}
          >
            ${cents / 100}
          </button>
        ))}
        <button
          type="button"
          onClick={() => update({ gratuityCents: isCustom ? data.gratuityCents : 0, gratuityCustom: data.gratuityCustom || '0' })}
          className={`min-h-[48px] rounded-card border px-6 text-sm font-semibold transition-colors ${
            isCustom ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray hover:border-black dark:border-[#2A2A2A] dark:hover:border-white'
          }`}
        >
          Custom
        </button>
        <button
          type="button"
          onClick={() => update({ gratuityCents: 0, gratuityCustom: '' })}
          className={`min-h-[48px] rounded-card border px-6 text-sm font-semibold transition-colors ${
            isNone ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray hover:border-black dark:border-[#2A2A2A] dark:hover:border-white'
          }`}
        >
          No thanks
        </button>
      </div>

      {isCustom && (
        <label className="mt-4 flex max-w-xs flex-col gap-1 text-sm font-semibold">
          Custom amount (USD)
          <input
            type="number"
            min={0}
            step={1}
            value={data.gratuityCustom}
            onChange={(e) => {
              const dollars = e.target.value;
              update({ gratuityCustom: dollars, gratuityCents: Math.max(0, Math.round(Number(dollars) * 100)) || 0 });
            }}
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
