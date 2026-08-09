'use client';

import { useMemo, useState } from 'react';

export interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  sentVia: string[];
  createdAt: string;
  profile: { fullName: string } | null;
}

export function NotificationsTable({ notifications }: { notifications: NotificationRow[] }) {
  const [type, setType] = useState('ALL');
  const types = useMemo(() => Array.from(new Set(notifications.map((n) => n.type))).sort(), [notifications]);
  const filtered = type === 'ALL' ? notifications : notifications.filter((n) => n.type === type);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white">
          <option value="ALL">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-xs text-medium-gray">{filtered.length} of {notifications.length}</span>
      </div>
      <div className="overflow-x-auto rounded-card border border-light-gray/10">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-medium-gray">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Sent via</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/10">
            {filtered.map((n) => (
              <tr key={n.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{n.title}</div>
                  <div className="text-xs text-medium-gray">{n.body}</div>
                </td>
                <td className="px-4 py-3 text-medium-gray">{n.profile?.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-medium-gray">{n.type}</td>
                <td className="px-4 py-3 text-medium-gray">{n.sentVia?.join(', ')}</td>
                <td className="px-4 py-3 text-medium-gray">{new Date(n.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-medium-gray">No notifications.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
