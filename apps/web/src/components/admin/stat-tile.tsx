import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
  urgent?: boolean;
  accent?: boolean;
}

export function StatTile({ label, value, hint, urgent, accent }: StatTileProps) {
  return (
    <Card className={cn('flex flex-col gap-1', urgent && 'ring-1 ring-gold/60')}>
      <span className="text-xs font-medium uppercase tracking-wide text-medium-gray">{label}</span>
      <span className={cn('font-display text-3xl font-bold text-white', accent && 'text-gold')}>{value}</span>
      {hint && <span className={cn('text-xs text-medium-gray', urgent && 'text-gold')}>{hint}</span>}
    </Card>
  );
}
