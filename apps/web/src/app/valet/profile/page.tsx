'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCents } from '@laxvaletcare/shared';
import { Button, Card } from '@/components/ui';
import { useValet } from '@/components/valet/ValetContext';
import { createClient } from '@/lib/supabase/client';

interface Stats {
  allTime: { jobsCompleted: number; ratingAvg: number | null; tipsTotalCents: number };
  today: { jobsCompleted: number; tipsTotalCents: number };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ValetProfilePage() {
  const { profile, refreshProfile, clockOut } = useValet();
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pwFields, setPwFields] = useState({ password: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [pwError, setPwError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/valet/stats').then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  const onPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await fetch('/api/valet/photo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      });
      if (res.ok) await refreshProfile();
    } finally {
      setUploading(false);
    }
  };

  const changePassword = async () => {
    setPwError('');
    if (pwFields.password.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    if (pwFields.password !== pwFields.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwStatus('saving');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pwFields.password });
    if (error) {
      setPwError(error.message);
      setPwStatus('error');
    } else {
      setPwStatus('done');
      setPwFields({ password: '', confirm: '' });
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <Card className="flex items-center gap-4 border border-light-gray">
        <div className="relative">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-light-gray bg-dark-gray">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-medium-gray">
                {profile.fullName.charAt(0)}
              </div>
            )}
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs text-black"
          >
            {uploading ? '…' : '✎'}
          </button>
          <input ref={inputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onPhotoSelected} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-white">{profile.fullName}</p>
          <p className="truncate text-sm text-medium-gray">{profile.email}</p>
          {profile.phone && <p className="text-sm text-medium-gray">{profile.phone}</p>}
          {!profile.photoUrl && <p className="mt-1 text-xs font-medium text-yellow-400">⚠️ Add a profile photo</p>}
        </div>
      </Card>

      <Card className="border border-light-gray">
        <p className="mb-3 font-display text-sm font-bold text-white">Stats</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-white">{stats?.allTime.jobsCompleted ?? '—'}</p>
            <p className="text-xs text-medium-gray">Jobs done</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats?.allTime.ratingAvg != null ? stats.allTime.ratingAvg.toFixed(1) : '—'}</p>
            <p className="text-xs text-medium-gray">Avg rating</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats ? formatCents(stats.allTime.tipsTotalCents) : '—'}</p>
            <p className="text-xs text-medium-gray">Tips total</p>
          </div>
        </div>
      </Card>

      <Card className="border border-light-gray">
        <p className="mb-2 font-display text-sm font-bold text-white">Today</p>
        <div className="flex justify-between text-sm">
          <span className="text-medium-gray">Jobs completed</span>
          <span className="text-white">{stats?.today.jobsCompleted ?? '—'}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-medium-gray">Tips earned</span>
          <span className="text-white">{stats ? formatCents(stats.today.tipsTotalCents) : '—'}</span>
        </div>
      </Card>

      <Card className="border border-light-gray">
        <p className="mb-3 font-display text-sm font-bold text-white">Change Password</p>
        <div className="space-y-2">
          <input
            type="password"
            placeholder="New password"
            value={pwFields.password}
            onChange={(e) => setPwFields((f) => ({ ...f, password: e.target.value }))}
            className="h-12 w-full rounded-card border border-light-gray bg-black px-3 text-sm text-white"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={pwFields.confirm}
            onChange={(e) => setPwFields((f) => ({ ...f, confirm: e.target.value }))}
            className="h-12 w-full rounded-card border border-light-gray bg-black px-3 text-sm text-white"
          />
          {pwError && <p className="text-xs text-red-400">{pwError}</p>}
          {pwStatus === 'done' && <p className="text-xs text-green-400">Password updated.</p>}
          <Button variant="secondary" className="h-12 w-full" onClick={changePassword} disabled={pwStatus === 'saving'}>
            {pwStatus === 'saving' ? 'Saving…' : 'Update Password'}
          </Button>
        </div>
      </Card>

      <Button variant="primary" className="h-14 w-full font-display font-bold" onClick={clockOut}>
        Clock Out
      </Button>
    </div>
  );
}
