'use client';

import { Button } from '@/components/ui';
import type { ValetWizardData } from './types';

export function StepVehicle({
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
  const canContinue = !!data.color && !!data.make && !!data.model;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Your vehicle</h2>
      <p className="mt-1 text-sm text-medium-gray">So your valet can find it — and treat it right.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Color
          <input
            type="text"
            value={data.color}
            onChange={(e) => update({ color: e.target.value })}
            placeholder="e.g. Silver"
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Make
          <input
            type="text"
            value={data.make}
            onChange={(e) => update({ make: e.target.value })}
            placeholder="e.g. Toyota"
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Model
          <input
            type="text"
            value={data.model}
            onChange={(e) => update({ model: e.target.value })}
            placeholder="e.g. Camry"
            className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
            required
          />
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold">Transmission</p>
        <div className="flex gap-3">
          {(['AUTOMATIC', 'MANUAL'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update({ transmission: t })}
              className={`min-h-[48px] flex-1 rounded-card border text-sm font-medium transition-colors sm:flex-none sm:px-8 ${
                data.transmission === t
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-light-gray hover:border-black dark:border-[#2A2A2A] dark:hover:border-white'
              }`}
            >
              {t === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.skipPlate}
            onChange={(e) => update({ skipPlate: e.target.checked, plate: '' })}
            className="h-5 w-5 rounded border-light-gray"
          />
          I&rsquo;ll add my plate later
        </label>
        {!data.skipPlate && (
          <input
            type="text"
            value={data.plate}
            onChange={(e) => update({ plate: e.target.value })}
            placeholder="License plate"
            className="mt-3 min-h-[48px] w-full max-w-xs rounded-card border border-light-gray bg-transparent px-3 text-sm dark:border-[#2A2A2A]"
          />
        )}
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
