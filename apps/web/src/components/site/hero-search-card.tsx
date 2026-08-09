'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OFF_SITE_ORIGINS, type OriginType } from '@laxvaletcare/shared';
import { toLocalInputValue } from '@/components/site/lib/format';

const ORIGIN_OPTIONS: { type: OriginType; label: string; description: string }[] = [
  { type: 'LAX', label: 'LAX', description: 'Los Angeles International Airport' },
  { type: 'JSX', label: 'JSX LAX', description: 'Private terminal near LAX' },
  { type: 'ATLANTIC_AVIATION', label: 'Atlantic Aviation', description: 'Private FBO near LAX' },
];

const defaultDeparture = toLocalInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000));
const defaultReturn = toLocalInputValue(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000));

export function HeroSearchCard() {
  const router = useRouter();
  const [origin, setOrigin] = useState<OriginType>('LAX');
  const [departureDate, setDepartureDate] = useState(defaultDeparture);
  const [returnDate, setReturnDate] = useState(defaultReturn);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      origin,
      departureDate,
      returnDate,
    });
    router.push(`/book/valet?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-card bg-white p-5 text-black shadow-hero sm:p-6"
    >
      <p className="mb-3 text-sm font-semibold text-medium-gray">Where are you flying from?</p>
      <div className="grid grid-cols-3 gap-2">
        {ORIGIN_OPTIONS.map((opt) => {
          const offSite = OFF_SITE_ORIGINS.find((o) => o.type === opt.type);
          const active = origin === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => setOrigin(opt.type)}
              className={`relative flex min-h-[64px] flex-col items-start justify-center rounded-card border px-3 py-2 text-left transition-colors ${
                active ? 'border-black bg-black text-white' : 'border-light-gray bg-white text-black hover:border-black'
              }`}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              {offSite && (
                <span className={`mt-0.5 text-[10px] font-medium ${active ? 'text-white/70' : 'text-medium-gray'}`}>
                  ⚠️ OFF-SITE
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-medium-gray">
          Departure date &amp; time
          <input
            type="datetime-local"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="min-h-[48px] rounded-card border border-light-gray px-3 text-sm text-black"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-medium-gray">
          Estimated return date &amp; time
          <input
            type="datetime-local"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="min-h-[48px] rounded-card border border-light-gray px-3 text-sm text-black"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-card bg-black px-6 text-base font-medium text-white transition-opacity hover:opacity-80"
      >
        Search availability
      </button>
    </form>
  );
}
