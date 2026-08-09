'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';

const CLASSES = ['ECONOMY', 'STANDARD', 'SUV', 'PREMIUM', 'LUXURY', 'VAN'];

const EMPTY = { class: 'STANDARD', make: '', model: '', year: new Date().getFullYear(), color: '', plate: '', dailyRateCents: 0, mileage: 0, location: '' };

export function FleetAddForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/admin/fleet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? 'Failed to add vehicle');
      return;
    }
    setForm(EMPTY);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return <Button variant="secondary" className="h-11 px-4 text-sm" onClick={() => setOpen(true)}>+ Add vehicle</Button>;
  }

  return (
    <Card className="flex flex-col gap-3">
      <h3 className="font-display text-sm font-bold text-white">New fleet vehicle</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs text-medium-gray">Class
          <select value={form.class} onChange={(e) => setForm((s) => ({ ...s, class: e.target.value }))} className="h-11 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white">
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <Field label="Make" value={form.make} onChange={(v) => setForm((s) => ({ ...s, make: v }))} />
        <Field label="Model" value={form.model} onChange={(v) => setForm((s) => ({ ...s, model: v }))} />
        <Field label="Year" value={String(form.year)} onChange={(v) => setForm((s) => ({ ...s, year: Number(v) || 0 }))} />
        <Field label="Color" value={form.color} onChange={(v) => setForm((s) => ({ ...s, color: v }))} />
        <Field label="Plate" value={form.plate} onChange={(v) => setForm((s) => ({ ...s, plate: v }))} />
        <Field label="Daily rate ($)" value={String(form.dailyRateCents / 100)} onChange={(v) => setForm((s) => ({ ...s, dailyRateCents: Math.round((parseFloat(v) || 0) * 100) }))} />
        <Field label="Mileage" value={String(form.mileage)} onChange={(v) => setForm((s) => ({ ...s, mileage: Number(v) || 0 }))} />
        <Field label="Location" value={form.location} onChange={(v) => setForm((s) => ({ ...s, location: v }))} />
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
      <div className="flex gap-2">
        <Button variant="primary" className="h-10 px-4 text-sm" onClick={submit} disabled={saving || !form.make || !form.model || !form.plate}>
          {saving ? 'Saving…' : 'Add vehicle'}
        </Button>
        <Button variant="ghost" className="h-10 px-4 text-sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </Card>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-medium-gray">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
    </label>
  );
}
