'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatCents } from '@laxvaletcare/shared';
import { StatusBadge } from '@/components/ui';

export interface ReservationRow {
  id: string;
  bookingCode: string;
  status: string;
  departureDate: string;
  returnDateEstimate: string;
  vehicleMake: string;
  vehicleModel: string;
  totalCents: number;
  customer: { fullName: string } | null;
  terminal: { code: string; name: string } | null;
}

const STATUSES = ['CONFIRMED', 'LIVE', 'CHECKED_IN', 'IN_TRIP', 'RETURN_REQUESTED', 'DELIVERING', 'DELIVERED_PENDING_CLOSE', 'CLOSED', 'CANCELLED', 'UPDATED'];

export function ReservationsTable({ reservations }: { reservations: ReservationRow[] }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [terminal, setTerminal] = useState('ALL');
  const [from, setFrom] = useState('');

  const terminals = useMemo(() => {
    const set = new Map<string, string>();
    for (const r of reservations) if (r.terminal) set.set(r.terminal.code, r.terminal.name);
    return Array.from(set.entries());
  }, [reservations]);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (status !== 'ALL' && r.status !== status) return false;
      if (terminal !== 'ALL' && r.terminal?.code !== terminal) return false;
      if (from && new Date(r.departureDate) < new Date(from)) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${r.bookingCode} ${r.customer?.fullName ?? ''} ${r.vehicleMake} ${r.vehicleModel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reservations, search, status, terminal, from]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search booking code, customer, vehicle…"
          className="h-11 min-w-64 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white placeholder:text-medium-gray focus:outline-none"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
        </select>
        <select value={terminal} onChange={(e) => setTerminal(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white">
          <option value="ALL">All terminals</option>
          {terminals.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white" />
        <span className="text-xs text-medium-gray">{filtered.length} of {reservations.length}</span>
      </div>

      <div className="overflow-x-auto rounded-card border border-light-gray/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-medium-gray">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Terminal</th>
              <th className="px-4 py-3">Departure</th>
              <th className="px-4 py-3">Return est.</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/10">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/reservations/${r.id}`} className="font-medium text-white hover:underline">{r.bookingCode}</Link>
                </td>
                <td className="px-4 py-3 text-medium-gray">{r.customer?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-medium-gray">{r.vehicleMake} {r.vehicleModel}</td>
                <td className="px-4 py-3 text-medium-gray">{r.terminal?.name ?? '—'}</td>
                <td className="px-4 py-3 text-medium-gray">{new Date(r.departureDate).toLocaleString()}</td>
                <td className="px-4 py-3 text-medium-gray">{new Date(r.returnDateEstimate).toLocaleString()}</td>
                <td className="px-4 py-3 text-white">{formatCents(r.totalCents)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-medium-gray">No reservations match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
