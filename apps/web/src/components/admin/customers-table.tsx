'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatCents } from '@laxvaletcare/shared';

export interface CustomerRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  bookingCount: number;
  lifetimeValueCents: number;
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => !q || `${c.fullName} ${c.email}`.toLowerCase().includes(q));
  }, [customers, search]);

  return (
    <div className="flex flex-col gap-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="h-11 w-full max-w-sm rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white placeholder:text-medium-gray focus:outline-none"
      />
      <div className="overflow-x-auto rounded-card border border-light-gray/10">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-medium-gray">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Lifetime value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/10">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-white/5">
                <td className="px-4 py-3"><Link href={`/admin/customers/${c.id}`} className="font-medium text-white hover:underline">{c.fullName}</Link></td>
                <td className="px-4 py-3 text-medium-gray">{c.email}{c.phone ? ` · ${c.phone}` : ''}</td>
                <td className="px-4 py-3 text-medium-gray">{c.bookingCount}</td>
                <td className="px-4 py-3 text-white">{formatCents(c.lifetimeValueCents)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-medium-gray">No customers match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
