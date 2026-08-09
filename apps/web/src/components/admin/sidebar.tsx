'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/reservations', label: 'Reservations', icon: '📋' },
  { href: '/admin/insurance-reviews', label: 'Insurance Reviews', icon: '🛡️' },
  { href: '/admin/fleet', label: 'Fleet', icon: '🚗' },
  { href: '/admin/valets', label: 'Valets', icon: '👷' },
  { href: '/admin/live-chats', label: 'Live Chats', icon: '💬' },
  { href: '/admin/payments', label: 'Payments', icon: '💰' },
  { href: '/admin/notifications', label: 'Notifications', icon: '📢' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/reports', label: 'Reports', icon: '📈' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 shrink-0 flex-col gap-1 border-r border-light-gray/20 bg-[var(--surface)] p-4">
      <div className="mb-6 px-2">
        <span className="font-display text-lg font-bold text-white">LAXValetCare</span>
        <div className="text-xs font-medium text-medium-gray">Admin</div>
      </div>
      {NAV.map((item) => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors',
              active ? 'bg-white text-black' : 'text-medium-gray hover:bg-white/5 hover:text-white',
            )}
          >
            <span aria-hidden>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
