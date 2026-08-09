import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

/** Primary: white-on-black (dark) / black-on-white (light). Secondary: outlined. Min 48px touch target. */
export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-card px-6 font-medium text-base transition-opacity hover:opacity-80 disabled:opacity-40 disabled:pointer-events-none',
        variant === 'primary' && 'bg-white text-black dark:bg-white dark:text-black',
        variant === 'secondary' && 'border border-black dark:border-white bg-transparent text-black dark:text-white',
        variant === 'ghost' && 'bg-transparent text-current',
        className,
      )}
      {...props}
    />
  );
}
