'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCents } from '@laxvaletcare/shared';
import { Button, Card, StatusBadge } from '@/components/ui';
import { ActionButton } from '@/components/admin/action-button';

const STATUSES = ['AVAILABLE', 'BUSY', 'BREAK', 'OFF'];

interface Valet {
  id: string; fullName: string; email: string; phone: string | null;
  valetStatus: string | null; queuePosition: number | null; clockedInAt: string | null;
}

interface Perf {
  jobCount: number;
  avgRating: number | null;
  totalTips: number;
}

export function ValetDetail({ valet, perf }: { valet: Valet; perf: Perf }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(valet.fullName);
  const [phone, setPhone] = useState(valet.phone ?? '');
  const [status, setStatus] = useState(valet.valetStatus ?? 'OFF');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/valets/${valet.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phone: phone || null, valetStatus: status }),
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
          <h1 className="font-display text-2xl font-bold text-white">{valet.fullName}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={valet.valetStatus ?? 'OFF'} />
            {valet.queuePosition != null && <span className="text-sm text-medium-gray">Queue position #{valet.queuePosition}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <ActionButton
            label="Deactivate"
            method="PATCH"
            url={`/api/admin/valets/${valet.id}`}
            body={{ valetStatus: 'OFF', queuePosition: null }}
            confirmText="Deactivate this valet? They will be removed from the live queue."
          />
          <ActionButton
            label="Delete permanently"
            method="DELETE"
            url={`/api/admin/valets/${valet.id}`}
            confirmText="Permanently delete this valet's account? This cannot be undone — prefer Deactivate in most cases."
            onDone={() => router.push('/admin/valets')}
            refresh={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><span className="text-xs uppercase text-medium-gray">Total jobs</span><div className="font-display text-2xl font-bold text-white">{perf.jobCount}</div></Card>
        <Card><span className="text-xs uppercase text-medium-gray">Avg rating</span><div className="font-display text-2xl font-bold text-white">{perf.avgRating != null ? `${perf.avgRating.toFixed(1)} ⭐` : '—'}</div></Card>
        <Card><span className="text-xs uppercase text-medium-gray">Total tips</span><div className="font-display text-2xl font-bold text-white">{formatCents(perf.totalTips)}</div></Card>
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-white">Profile</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-medium-gray">Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-medium-gray">Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-medium-gray">Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <span className="text-xs text-medium-gray">Email: {valet.email}</span>
        <span className="text-xs text-medium-gray">Clocked in: {valet.clockedInAt ? new Date(valet.clockedInAt).toLocaleString() : 'not currently clocked in'}</span>
        <div><Button variant="secondary" className="h-10 px-4 text-sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button></div>
      </Card>
    </div>
  );
}
