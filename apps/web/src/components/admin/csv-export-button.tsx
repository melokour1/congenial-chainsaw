'use client';

import { Button } from '@/components/ui';

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}

/** Client-side CSV export — no library needed. */
export function CsvExportButton({ rows, filename, label = 'Export CSV' }: { rows: Record<string, unknown>[]; filename: string; label?: string }) {
  function download() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return <Button variant="secondary" className="h-10 px-4 text-sm" onClick={download} disabled={rows.length === 0}>{label}</Button>;
}
