'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type TabId = 'valet' | 'rentals' | 'monthly' | 'delivered';

const TABS: { id: TabId; label: string; comingSoon?: boolean }[] = [
  { id: 'valet', label: 'Valet' },
  { id: 'rentals', label: 'Rentals' },
  { id: 'monthly', label: 'Monthly', comingSoon: true },
  { id: 'delivered', label: 'Delivered', comingSoon: true },
];

const CONTENT: Record<TabId, { title: string; body: string; cta: { href: string; label: string } | null }> = {
  valet: {
    title: 'Airport valet at LAX',
    body: 'Drop your keys curbside at any LAX terminal, JSX, or Atlantic Aviation. We store your car indoors, track it in real time, and deliver it back before you land.',
    cta: { href: '/book/valet', label: 'Book valet' },
  },
  rentals: {
    title: 'Vehicle rentals',
    body: 'Economy to luxury, delivered to your lot, your terminal, or your door. Identity and insurance verified before every rental — no lines.',
    cta: { href: '/book/rent', label: 'Browse the fleet' },
  },
  monthly: {
    title: 'Monthly parking',
    body: 'Long-term indoor storage with the same real-time visibility as a single trip. Coming soon.',
    cta: null,
  },
  delivered: {
    title: 'Delivered service',
    body: 'Car care and fuel delivered to you, wherever you park. Coming soon.',
    cta: null,
  },
};

export function ServiceTabs() {
  const [active, setActive] = useState<TabId>('valet');
  const content = CONTENT[active];

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6">
      <div className="flex gap-2 overflow-x-auto border-b border-light-gray dark:border-[#2A2A2A]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              'relative min-h-[48px] shrink-0 px-4 text-sm font-semibold transition-colors',
              active === tab.id ? 'text-black dark:text-white' : 'text-medium-gray hover:text-black dark:hover:text-white',
            )}
          >
            {tab.label}
            {tab.comingSoon && <span className="ml-1.5 text-[10px] font-medium text-medium-gray">soon</span>}
            {active === tab.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-black dark:bg-white" />}
          </button>
        ))}
      </div>

      <div className="py-8">
        <h2 className="font-display text-2xl font-bold">{content.title}</h2>
        <p className="mt-2 max-w-xl text-medium-gray">{content.body}</p>
        {content.cta ? (
          <Link
            href={content.cta.href}
            className="mt-4 inline-flex min-h-[48px] items-center rounded-card border border-black px-6 text-sm font-medium hover:opacity-80 dark:border-white"
          >
            {content.cta.label}
          </Link>
        ) : (
          <span className="mt-4 inline-flex min-h-[48px] items-center rounded-card border border-light-gray px-6 text-sm font-medium text-medium-gray dark:border-[#2A2A2A]">
            Coming soon
          </span>
        )}
      </div>
    </div>
  );
}
