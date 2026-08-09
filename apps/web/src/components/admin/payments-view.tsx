'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { formatCents } from '@laxvaletcare/shared';
import { Card } from '@/components/ui';
import { CsvExportButton } from '@/components/admin/csv-export-button';
import { ActionButton } from '@/components/admin/action-button';

export interface PaymentRow {
  id: string;
  kind: 'RESERVATION' | 'RENTAL';
  bookingCode: string;
  status: string;
  totalCents: number;
  stripePaymentIntentId: string | null;
  createdAt: string;
  customerName: string;
  depositHoldCents?: number;
}

export function PaymentsView({ rows }: { rows: PaymentRow[] }) {
  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (r.status !== 'CLOSED' && r.status !== 'RETURNED' && r.status !== 'PICKED_UP') continue;
      const day = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map.set(day, (map.get(day) ?? 0) + r.totalCents);
    }
    return Array.from(map.entries()).slice(-14);
  }, [rows]);

  const totalRevenue = rows.reduce((s, r) => s + r.totalCents, 0);
  const maxDay = Math.max(1, ...revenueByDay.map(([, v]) => v));

  const rentalRows = rows.filter((r) => r.kind === 'RENTAL' && (r.depositHoldCents ?? 0) > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><span className="text-xs uppercase text-medium-gray">Total volume</span><div className="font-display text-2xl font-bold text-white">{formatCents(totalRevenue)}</div></Card>
        <Card><span className="text-xs uppercase text-medium-gray">Transactions</span><div className="font-display text-2xl font-bold text-white">{rows.length}</div></Card>
        <Card><span className="text-xs uppercase text-medium-gray">Deposits held</span><div className="font-display text-2xl font-bold text-white">{formatCents(rentalRows.reduce((s, r) => s + (r.depositHoldCents ?? 0), 0))}</div></Card>
      </div>

      <Card>
        <h2 className="mb-4 font-display text-lg font-bold text-white">Revenue by day</h2>
        <div className="flex h-40 items-end gap-2">
          {revenueByDay.map(([day, value]) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-t-card bg-gold/70" style={{ height: `${Math.max(4, (value / maxDay) * 140)}px` }} title={formatCents(value)} />
              <span className="text-[10px] text-medium-gray">{day}</span>
            </div>
          ))}
          {revenueByDay.length === 0 && <p className="text-sm text-medium-gray">No closed transactions yet.</p>}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">All transactions</h2>
        <CsvExportButton
          filename="payments.csv"
          rows={rows.map((r) => ({ booking: r.bookingCode, type: r.kind, customer: r.customerName, status: r.status, totalDollars: (r.totalCents / 100).toFixed(2), stripePaymentIntentId: r.stripePaymentIntentId ?? '', date: r.createdAt }))}
        />
      </div>

      <div className="overflow-x-auto rounded-card border border-light-gray/10">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-medium-gray">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Stripe PI</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/10">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  {r.kind === 'RESERVATION' ? (
                    <Link href={`/admin/reservations/${r.id}`} className="font-medium text-white hover:underline">{r.bookingCode}</Link>
                  ) : <span className="font-medium text-white">{r.bookingCode}</span>}
                </td>
                <td className="px-4 py-3 text-medium-gray">{r.kind === 'RESERVATION' ? 'Valet' : 'Rental'}</td>
                <td className="px-4 py-3 text-medium-gray">{r.customerName}</td>
                <td className="px-4 py-3 text-white">{formatCents(r.totalCents)}</td>
                <td className="px-4 py-3 text-medium-gray">{r.stripePaymentIntentId ?? '—'}</td>
                <td className="px-4 py-3 text-medium-gray">{r.status}</td>
                <td className="px-4 py-3 text-medium-gray">{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-white">Rental deposits</h2>
        {rentalRows.length === 0 && <p className="text-sm text-medium-gray">No active deposit holds.</p>}
        <div className="flex flex-col divide-y divide-light-gray/10">
          {rentalRows.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <span className="font-medium text-white">{r.bookingCode}</span>
                <span className="ml-2 text-medium-gray">{r.customerName} · {formatCents(r.depositHoldCents ?? 0)} held</span>
              </div>
              <div className="flex gap-2">
                <ActionButton label="Capture" url="/api/admin/deposit" body={{ rentalBookingId: r.id, action: 'CAPTURE' }} onDone={(j) => alert(j.note)} />
                <ActionButton label="Release" url="/api/admin/deposit" body={{ rentalBookingId: r.id, action: 'RELEASE' }} onDone={(j) => alert(j.note)} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
