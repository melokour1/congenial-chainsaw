'use client';

import { formatCents } from '@laxvaletcare/shared';
import { Button, Card } from '@/components/ui';
import { CsvExportButton } from '@/components/admin/csv-export-button';

function BarRow({ label, value, max, formatValue }: { label: string; value: number; max: number; formatValue: (v: number) => string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 truncate text-xs text-medium-gray">{label}</span>
      <div className="h-3 flex-1 rounded-full bg-white/5">
        <div className="h-3 rounded-full bg-gold/70" style={{ width: `${Math.max(2, (value / max) * 100)}%` }} />
      </div>
      <span className="w-20 shrink-0 text-right text-xs text-white">{formatValue(value)}</span>
    </div>
  );
}

export interface ReportsData {
  revenueByDay: [string, number][];
  volumeByDay: [string, number][];
  serviceTier: [string, number][];
  addOnPopularity: [string, number][];
  repeatCustomerRatePct: number;
  topCustomers: { name: string; ltv: number }[];
  valetPerformance: { name: string; jobs: number; avgRating: number | null; tips: number }[];
  terminalPopularity: [string, number][];
  dayOfWeek: [string, number][];
}

export function ReportsView({ data }: { data: ReportsData }) {
  const maxRevenue = Math.max(1, ...data.revenueByDay.map(([, v]) => v));
  const maxTier = Math.max(1, ...data.serviceTier.map(([, v]) => v));
  const maxAddOn = Math.max(1, ...data.addOnPopularity.map(([, v]) => v));
  const maxTerminal = Math.max(1, ...data.terminalPopularity.map(([, v]) => v));
  const maxDow = Math.max(1, ...data.dayOfWeek.map(([, v]) => v));
  const maxCustomerLtv = Math.max(1, ...data.topCustomers.map((c) => c.ltv));
  const maxJobs = Math.max(1, ...data.valetPerformance.map((v) => v.jobs));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="secondary" className="h-10 px-4 text-sm" onClick={() => window.print()}>Export PDF (Print)</Button>
        <CsvExportButton
          filename="reports-top-customers.csv"
          rows={data.topCustomers.map((c) => ({ customer: c.name, lifetimeValueDollars: (c.ltv / 100).toFixed(2) }))}
          label="Export top customers CSV"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Revenue over time</h2>
          <div className="flex flex-col gap-2">
            {data.revenueByDay.map(([day, v]) => <BarRow key={day} label={day} value={v} max={maxRevenue} formatValue={formatCents} />)}
            {data.revenueByDay.length === 0 && <p className="text-sm text-medium-gray">No revenue yet.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Booking volume</h2>
          <div className="flex flex-col gap-2">
            {data.volumeByDay.map(([day, v]) => <BarRow key={day} label={day} value={v} max={Math.max(1, ...data.volumeByDay.map(([, x]) => x))} formatValue={(v2) => String(v2)} />)}
            {data.volumeByDay.length === 0 && <p className="text-sm text-medium-gray">No bookings yet.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Service tier breakdown</h2>
          <div className="flex flex-col gap-2">
            {data.serviceTier.map(([t, v]) => <BarRow key={t} label={t.replaceAll('_', ' ')} value={v} max={maxTier} formatValue={(v2) => String(v2)} />)}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Add-on popularity</h2>
          <div className="flex flex-col gap-2">
            {data.addOnPopularity.map(([t, v]) => <BarRow key={t} label={t.replaceAll('_', ' ')} value={v} max={maxAddOn} formatValue={(v2) => String(v2)} />)}
            {data.addOnPopularity.length === 0 && <p className="text-sm text-medium-gray">No add-ons purchased yet.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Terminal popularity</h2>
          <div className="flex flex-col gap-2">
            {data.terminalPopularity.map(([t, v]) => <BarRow key={t} label={t} value={v} max={maxTerminal} formatValue={(v2) => String(v2)} />)}
            {data.terminalPopularity.length === 0 && <p className="text-sm text-medium-gray">No terminal data yet.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Day-of-week distribution</h2>
          <div className="flex flex-col gap-2">
            {data.dayOfWeek.map(([d, v]) => <BarRow key={d} label={d} value={v} max={maxDow} formatValue={(v2) => String(v2)} />)}
          </div>
        </Card>
      </div>

      <Card className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-white">Repeat customer rate</h2>
        <span className="font-display text-3xl font-bold text-gold">{data.repeatCustomerRatePct.toFixed(1)}%</span>
        <span className="text-sm text-medium-gray">of customers with more than one booking.</span>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-bold text-white">Top customers</h2>
        <div className="flex flex-col gap-2">
          {data.topCustomers.map((c) => <BarRow key={c.name} label={c.name} value={c.ltv} max={maxCustomerLtv} formatValue={formatCents} />)}
          {data.topCustomers.length === 0 && <p className="text-sm text-medium-gray">No customers yet.</p>}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-bold text-white">Valet performance</h2>
        <div className="flex flex-col gap-2">
          {data.valetPerformance.map((v) => (
            <div key={v.name} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-xs text-medium-gray">{v.name}</span>
              <div className="h-3 flex-1 rounded-full bg-white/5"><div className="h-3 rounded-full bg-gold/70" style={{ width: `${Math.max(2, (v.jobs / maxJobs) * 100)}%` }} /></div>
              <span className="w-16 shrink-0 text-right text-xs text-white">{v.jobs} jobs</span>
              <span className="w-16 shrink-0 text-right text-xs text-white">{v.avgRating != null ? `${v.avgRating.toFixed(1)}⭐` : '—'}</span>
              <span className="w-20 shrink-0 text-right text-xs text-white">{formatCents(v.tips)}</span>
            </div>
          ))}
          {data.valetPerformance.length === 0 && <p className="text-sm text-medium-gray">No valets yet.</p>}
        </div>
      </Card>
    </div>
  );
}
