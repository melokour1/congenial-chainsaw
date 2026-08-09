'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/book/valet', label: 'Airport Valet' },
  { href: '/book/rent', label: 'Rentals' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-light-gray bg-off-white/90 backdrop-blur dark:border-[#2A2A2A] dark:bg-black/90">
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          LAXValetCare
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium text-medium-gray transition-colors hover:text-black dark:hover:text-white',
                pathname?.startsWith(link.href) && 'text-black dark:text-white',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {signedIn ? (
            <Link href="/account">
              <Button variant="secondary" className="h-11">Account</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="h-11">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" className="h-11">Create account</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="flex h-11 w-11 items-center justify-center rounded-card border border-light-gray dark:border-[#2A2A2A] md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="text-xl leading-none">{menuOpen ? '×' : '☰'}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-light-gray px-4 pb-4 dark:border-[#2A2A2A] md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-card px-2 py-3 text-sm font-medium text-medium-gray hover:bg-[var(--surface)] hover:text-black dark:hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/about" className="rounded-card px-2 py-3 text-sm font-medium text-medium-gray" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            <div className="mt-2 flex gap-2">
              {signedIn ? (
                <Link href="/account" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" className="h-11 w-full">Account</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                    <Button variant="secondary" className="h-11 w-full">Sign in</Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                    <Button variant="primary" className="h-11 w-full">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
