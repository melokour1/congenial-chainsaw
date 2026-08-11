import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<LogoProps['size']>, { pad: string; text: string }> = {
  sm: { pad: 'px-5 py-3', text: 'text-base' },
  md: { pad: 'px-6 py-4', text: 'text-xl' },
  lg: { pad: 'px-10 py-6', text: 'text-4xl' },
};

/**
 * The brand wordmark, as its own fixed black lockup — deliberately not
 * theme-aware (unlike the rest of the site) so it reads identically on the
 * light nav bar and the dark footer/admin sidebar. One continuous word, one
 * geometric sans throughout (Jost) — "Valet" is set apart from "LAX"/"Care"
 * by color alone (warm gold vs. white), not a font or weight change.
 */
export function Logo({ size = 'md', className }: LogoProps) {
  const s = SIZE_CLASSES[size];
  return (
    <span className={cn('inline-flex items-center justify-center rounded-card bg-black', s.pad, className)}>
      <span className={cn('font-wordmark font-bold tracking-tight text-white', s.text)}>LAX</span>
      <span className={cn('font-wordmark font-bold tracking-tight text-[#E0A458]', s.text)}>Valet</span>
      <span className={cn('font-wordmark font-bold tracking-tight text-white', s.text)}>Care</span>
    </span>
  );
}
