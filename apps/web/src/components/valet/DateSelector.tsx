'use client';

const DAY_COUNT = 8; // today + next 7 days — future days are read-only per spec's access table

function dateForOffset(offset: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

export function dateLabel(offset: number): string {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return dateForOffset(offset).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function isSameDayAsOffset(iso: string, offset: number): boolean {
  return new Date(iso).toDateString() === dateForOffset(offset).toDateString();
}

export function DateSelector({ selectedOffset, onSelect }: { selectedOffset: number; onSelect: (offset: number) => void }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {Array.from({ length: DAY_COUNT }, (_, i) => i).map((offset) => (
        <button
          key={offset}
          onClick={() => onSelect(offset)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
            offset === selectedOffset ? 'bg-white text-black' : 'border border-light-gray text-medium-gray'
          }`}
        >
          {dateLabel(offset)}
        </button>
      ))}
    </div>
  );
}
