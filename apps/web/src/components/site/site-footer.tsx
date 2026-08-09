import Link from 'next/link';

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Services',
    links: [
      { href: '/book/valet', label: 'Airport valet' },
      { href: '/book/rent', label: 'Vehicle rentals' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/how-it-works', label: 'How it works' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/faq', label: 'FAQ' },
      { href: '/account/chat', label: 'Ask LAXValetCare' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of service' },
      { href: '/privacy', label: 'Privacy policy' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/register', label: 'Create account' },
      { href: '/account/activity', label: 'My activity' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-light-gray bg-off-white dark:border-[#2A2A2A] dark:bg-black">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-4">
            <span className="font-display text-lg font-bold">LAXValetCare</span>
            <p className="mt-2 max-w-sm text-sm text-medium-gray">
              Valet, reinvented. Airport valet at LAX and vehicle rentals — on your terms.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-bold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-medium-gray hover:text-black dark:hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-light-gray pt-6 text-xs text-medium-gray dark:border-[#2A2A2A] sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} LAXValetCare. All rights reserved.</span>
          <span>Los Angeles International Airport (LAX)</span>
        </div>
      </div>
    </footer>
  );
}
