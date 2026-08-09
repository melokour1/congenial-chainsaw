function IconBuilding() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" strokeLinecap="round" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 3l2.6 5.8 6.2.6-4.7 4.2 1.4 6.2-5.5-3.3-5.5 3.3 1.4-6.2-4.7-4.2 6.2-.6L12 3z" strokeLinejoin="round" />
    </svg>
  );
}

const BADGES = [
  { Icon: IconBuilding, label: 'Indoor parking' },
  { Icon: IconShield, label: 'Insured' },
  { Icon: IconPin, label: 'Real-time updates' },
  { Icon: IconStar, label: '5-star reviews' },
];

export function TrustBadges() {
  return (
    <div className="border-y border-light-gray bg-off-white dark:border-[#2A2A2A] dark:bg-dark-gray">
      <div className="mx-auto grid max-w-content grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
        {BADGES.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:text-left">
            <badge.Icon />
            <span className="text-sm font-semibold">{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
