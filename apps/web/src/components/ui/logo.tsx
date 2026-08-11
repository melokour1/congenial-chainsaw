import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<LogoProps['size']>, { pad: string; sans: string; serif: string }> = {
  sm: { pad: 'px-3 py-1.5', sans: 'text-sm', serif: 'text-base' },
  md: { pad: 'px-4 py-2', sans: 'text-base', serif: 'text-lg' },
  lg: { pad: 'px-6 py-3', sans: 'text-3xl', serif: 'text-4xl' },
};

/**
 * The brand wordmark, as its own fixed black-and-white lockup — deliberately not
 * theme-aware (unlike the rest of the site) so it reads identically on the light
 * nav bar and the dark footer/admin sidebar. "Valet" breaks into an italic serif
 * to set it apart from "LAX"/"Care" in the regular display sans.
 */
export function Logo({ size = 'md', className }: LogoProps) {
  const s = SIZE_CLASSES[size];
  return (
    <span className={cn('inline-flex items-baseline rounded-card bg-black', s.pad, className)}>
      <span className={cn('font-display font-extrabold tracking-tight text-white', s.sans)}>LAX</span>
      <span className={cn('font-wordmark italic font-bold text-white', s.serif)}>Valet</span>
      <span className={cn('font-display font-extrabold tracking-tight text-white', s.sans)}>Care</span>
    </span>
  );
}
