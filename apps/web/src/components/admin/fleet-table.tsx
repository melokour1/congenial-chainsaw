'use client';

import Link from 'next/link';
import { formatCents } from '@laxvaletcare/shared';

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: 'bg-green-500/15 text-green-400',
  RENTED: 'bg-blue-500/15 text-blue-400',
  MAINTENANCE: 'bg-yellow-500/15 text-yellow-500',
};

export interface FleetRow {
  id: string;
  class: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  dailyRateCents: number;
  status: string;
  mileage: number;
  location: string | null;
}

export function FleetTable({ vehicles }: { vehicles: FleetRow[] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-light-gray/10">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-medium-gray">
          <tr>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3">Plate</th>
            <th className="px-4 py-3">Daily rate</th>
            <th className="px-4 py-3">Mileage</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-light-gray/10">
          {vehicles.map((v) => (
            <tr key={v.id} className="hover:bg-white/5">
              <td className="px-4 py-3">
                <Link href={`/admin/fleet/${v.id}`} className="font-medium text-white hover:underline">{v.year} {v.make} {v.model}</Link>
                <div className="text-xs text-medium-gray">{v.color}</div>
              </td>
              <td className="px-4 py-3 text-medium-gray">{v.class}</td>
              <td className="px-4 py-3 text-medium-gray">{v.plate}</td>
              <td className="px-4 py-3 text-white">{formatCents(v.dailyRateCents)}/day</td>
              <td className="px-4 py-3 text-medium-gray">{v.mileage.toLocaleString()} mi</td>
              <td className="px-4 py-3 text-medium-gray">{v.location ?? '—'}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[v.status] ?? ''}`}>{v.status}</span></td>
            </tr>
          ))}
          {vehicles.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-medium-gray">No vehicles in the fleet yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
