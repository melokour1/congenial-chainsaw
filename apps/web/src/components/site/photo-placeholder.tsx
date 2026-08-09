import { cn } from '@/lib/utils';

/**
 * Stand-in for real photography (no photo assets exist yet). A dark gradient div with a
 * subtle border and a caption noting what photo would go here in production.
 */
export function PhotoPlaceholder({
  label,
  className,
  aspect = 'aspect-[16/10]',
  bare = false,
}: {
  label: string;
  className?: string;
  aspect?: string;
  /** Skip the rounded-card border chrome — used for full-bleed hero backgrounds. */
  bare?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'relative flex items-end overflow-hidden',
        !bare && 'rounded-card border border-light-gray dark:border-[#2A2A2A]',
        'bg-gradient-to-br from-dark-gray via-black to-dark-gray',
        aspect,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
      <span className="relative z-10 m-4 max-w-[80%] text-xs font-medium text-medium-gray">
        Photo: {label}
      </span>
    </div>
  );
}
