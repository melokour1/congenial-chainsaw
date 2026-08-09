'use client';

import { OFF_SITE_ORIGINS, type OriginType } from '@laxvaletcare/shared';
import { Button } from '@/components/ui';
import type { ValetWizardData } from './types';

const OPTIONS: { type: OriginType; label: string; description: string }[] = [
  { type: 'LAX', label: 'LAX', description: 'Los Angeles International Airport — any terminal' },
  { type: 'JSX', label: 'JSX LAX', description: 'Private terminal near LAX' },
  { type: 'ATLANTIC_AVIATION', label: 'Atlantic Aviation', description: 'Private FBO near LAX' },
];

export function StepOrigin({
  data,
  update,
  onNext,
}: {
  data: ValetWizardData;
  update: (patch: Partial<ValetWizardData>) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Where are you flying from?</h2>
      <p className="mt-1 text-sm text-medium-gray">We meet you wherever you depart.</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const offSite = OFF_SITE_ORIGINS.find((o) => o.type === opt.type);
          const active = data.originType === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => update({ originType: opt.type })}
              className={`flex flex-col items-start gap-1 rounded-card border p-4 text-left transition-colors ${
                active ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'border-light-gray hover:border-black dark:border-[#2A2A2A] dark:hover:border-white'
              }`}
            >
              <span className="font-display text-lg font-bold">{opt.label}</span>
              <span className={`text-xs ${active ? 'opacity-80' : 'text-medium-gray'}`}>{opt.description}</span>
              {offSite && (
                <>
                  <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${active ? 'bg-white/20' : 'bg-off-white dark:bg-dark-gray'}`}>
                    ⚠️ OFF-SITE
                  </span>
                  <span className={`text-[11px] ${active ? 'opacity-80' : 'text-medium-gray'}`}>{offSite.address}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="primary" className="h-12 px-8" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
