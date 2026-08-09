import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: 'bg-blue-500/15 text-blue-400',
  LIVE: 'bg-red-500/15 text-red-400',
  CHECKED_IN: 'bg-yellow-500/15 text-yellow-500',
  IN_TRIP: 'bg-sky-500/15 text-sky-400',
  RETURN_REQUESTED: 'bg-orange-500/15 text-orange-400',
  DELIVERING: 'bg-orange-500/15 text-orange-400',
  DELIVERED_PENDING_CLOSE: 'bg-purple-500/15 text-purple-400',
  CLOSED: 'bg-green-500/15 text-green-400',
  CANCELLED: 'bg-gray-500/15 text-gray-400',
  UPDATED: 'bg-indigo-500/15 text-indigo-400',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap', STATUS_STYLE[status] ?? 'bg-gray-500/15 text-gray-400')}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}
