'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';

export function ValetAddForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/admin/valets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone: phone || undefined }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? 'Failed to add valet');
      return;
    }
    setCreated({ email, tempPassword: json.tempPassword });
    setFullName('');
    setEmail('');
    setPhone('');
    router.refresh();
  }

  if (!open) {
    return <Button variant="secondary" className="h-11 px-4 text-sm" onClick={() => setOpen(true)}>+ Add valet</Button>;
  }

  if (created) {
    return (
      <Card className="flex flex-col gap-2">
        <h3 className="font-display text-sm font-bold text-white">Valet account created</h3>
        <p className="text-sm text-medium-gray">Share these temporary credentials — the valet should change the password on first sign-in.</p>
        <div className="rounded-card bg-white/5 p-3 text-sm">
          <div className="text-white">Email: {created.email}</div>
          <div className="text-white">Temp password: <span className="font-mono">{created.tempPassword}</span></div>
        </div>
        <Button variant="ghost" className="h-10 w-fit px-4 text-sm" onClick={() => { setCreated(null); setOpen(false); }}>Done</Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <h3 className="font-display text-sm font-bold text-white">New valet</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs text-medium-gray">Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-medium-gray">Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-medium-gray">Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
        </label>
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
      <div className="flex gap-2">
        <Button variant="primary" className="h-10 px-4 text-sm" onClick={submit} disabled={saving || !fullName || !email}>{saving ? 'Creating…' : 'Create valet account'}</Button>
        <Button variant="ghost" className="h-10 px-4 text-sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </Card>
  );
}
