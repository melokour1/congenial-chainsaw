export { formatCents } from '@laxvaletcare/shared';

export function formatDate(iso: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function daysBetween(start: Date | string, end: Date | string): number {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const RESERVATION_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  LIVE: 'Live',
  CHECKED_IN: 'Checked in',
  IN_TRIP: 'In trip',
  RETURN_REQUESTED: 'Return requested',
  DELIVERING: 'Delivering',
  DELIVERED_PENDING_CLOSE: 'Delivered',
  CLOSED: 'Completed',
  CANCELLED: 'Cancelled',
  UPDATED: 'Updated',
};

export const RENTAL_STATUS_LABEL: Record<string, string> = {
  PENDING_VERIFICATION: 'Verification needed',
  PENDING_INSURANCE: 'Insurance pending',
  READY: 'Ready for pickup',
  PICKED_UP: 'Picked up',
  RETURNED: 'Returned',
  OVERDUE: 'Overdue',
  CLOSED: 'Completed',
  CANCELLED: 'Cancelled',
};
