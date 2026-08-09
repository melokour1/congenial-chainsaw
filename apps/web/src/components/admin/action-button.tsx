'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  label: string;
  method?: 'POST' | 'PATCH' | 'DELETE';
  url: string;
  body?: Record<string, unknown> | (() => Record<string, unknown>);
  confirmText?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  onDone?: (json: any) => void;
  refresh?: boolean;
  disabled?: boolean;
}

/** Generic fetch-and-refresh button used across admin pages (approve/reject/cancel/deactivate/close/etc.) */
export function ActionButton({
  label, method = 'POST', url, body, confirmText, variant = 'secondary', className, onDone, refresh = true, disabled,
}: ActionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (confirmText && !window.confirm(confirmText)) return;
    setLoading(true);
    setError(null);
    try {
      const payload = typeof body === 'function' ? body() : body;
      const res = await fetch(url, {
        method,
        headers: payload ? { 'Content-Type': 'application/json' } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong');
        return;
      }
      onDone?.(json);
      if (refresh) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <Button variant={variant} className={cn('h-10 px-4 text-sm', className)} onClick={run} disabled={loading || disabled}>
        {loading ? 'Working…' : label}
      </Button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
