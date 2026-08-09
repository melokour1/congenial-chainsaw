'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/ui';

export interface ValetRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  valetStatus: string | null;
  queuePosition: number | null;
  todaysJobCount: number;
}

export function ValetsTable({ valets }: { valets: ValetRow[] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-light-gray/10">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-medium-gray">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Queue #</th>
            <th className="px-4 py-3">Today's jobs</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-light-gray/10">
          {valets.map((v) => (
            <tr key={v.id} className="hover:bg-white/5">
              <td className="px-4 py-3">
                <Link href={`/admin/valets/${v.id}`} className="font-medium text-white hover:underline">{v.fullName}</Link>
                <div className="text-xs text-medium-gray">{v.email}</div>
              </td>
              <td className="px-4 py-3 text-medium-gray">{v.queuePosition ?? '—'}</td>
              <td className="px-4 py-3 text-medium-gray">{v.todaysJobCount}</td>
              <td className="px-4 py-3"><StatusBadge status={v.valetStatus ?? 'OFF'} /></td>
            </tr>
          ))}
          {valets.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-medium-gray">No valets on record.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
