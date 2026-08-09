'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCents } from '@laxvaletcare/shared';
import { Button, Card, StatusBadge } from '@/components/ui';
import { ActionButton } from '@/components/admin/action-button';

const CLASSES = ['ECONOMY', 'STANDARD', 'SUV', 'PREMIUM', 'LUXURY', 'VAN'];
const STATUSES = ['AVAILABLE', 'RENTED', 'MAINTENANCE'];

interface RentalHistoryRow {
  id: string;
  bookingCode: string;
  status: string;
  pickupDate: string;
  returnDate: string;
  totalCents: number;
  customer: { fullName: string } | null;
}

interface FleetVehicle {
  id: string; class: string; make: string; model: string; year: number; color: string; plate: string;
  dailyRateCents: number; photos: string[]; status: string; mileage: number; location: string | null;
}

export function FleetVehicleDetail({ vehicle, history }: { vehicle: FleetVehicle; history: RentalHistoryRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    class: vehicle.class, make: vehicle.make, model: vehicle.model, year: vehicle.year, color: vehicle.color,
    plate: vehicle.plate, dailyRateCents: vehicle.dailyRateCents, status: vehicle.status, mileage: vehicle.mileage,
    location: vehicle.location ?? '',
  });
  const [photos, setPhotos] = useState<string[]>(vehicle.photos ?? []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(overridePhotos?: string[]) {
    setSaving(true);
    const res = await fetch(`/api/admin/fleet/${vehicle.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        dailyRateCents: Number(form.dailyRateCents),
        year: Number(form.year),
        mileage: Number(form.mileage),
        location: form.location || null,
        photos: overridePhotos ?? photos,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? 'Save failed');
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
          <p className="text-sm text-medium-gray">Plate {vehicle.plate} · {vehicle.class}</p>
        </div>
        <ActionButton
          label="Remove vehicle"
          method="DELETE"
          url={`/api/admin/fleet/${vehicle.id}`}
          confirmText="Remove this vehicle from the fleet? This cannot be undone."
          onDone={() => router.push('/admin/fleet')}
          refresh={false}
        />
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-white">Specs &amp; pricing</h2>
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
          <Field label="Mileage" value={String(form.mileage)} onChange={(v) => setForm((s) => ({ ...s, mileage: v ? Number(v) : 0 }))} />
          <Field label="Location" value={form.location} onChange={(v) => setForm((s) => ({ ...s, location: v }))} />
          <label className="flex flex-col gap-1 text-xs text-medium-gray">Status
            <select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))} className="h-11 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div>
          <Button variant="primary" className="h-10 px-4 text-sm" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-white">Photos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="aspect-square w-full rounded-card object-cover" />
              <button
                onClick={() => { const next = photos.filter((_, idx) => idx !== i); setPhotos(next); save(next); }}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
              >✕</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="Photo URL" className="h-11 flex-1 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white placeholder:text-medium-gray focus:outline-none" />
          <Button
            variant="secondary" className="h-11 px-4 text-sm"
            onClick={() => { if (!newPhotoUrl) return; const next = [...photos, newPhotoUrl]; setPhotos(next); setNewPhotoUrl(''); save(next); }}
          >Add</Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-white">Rental history</h2>
        <div className="flex flex-col divide-y divide-light-gray/10 text-sm">
          {history.length === 0 && <p className="py-2 text-medium-gray">No rentals for this vehicle yet.</p>}
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between py-2">
              <div>
                <span className="font-medium text-white">{h.bookingCode}</span>
                <span className="ml-2 text-medium-gray">{h.customer?.fullName ?? '—'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-medium-gray">{new Date(h.pickupDate).toLocaleDateString()} → {new Date(h.returnDate).toLocaleDateString()}</span>
                <span className="text-white">{formatCents(h.totalCents)}</span>
                <StatusBadge status={h.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
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
