'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface ConfirmDialogProps {
  title: string;
  /** The literal customer-facing message, when this action sends one — shown verbatim per spec 4.6. */
  sendMessage?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  danger?: boolean;
}

/** Every valet action button MUST confirm via this dialog first (spec 4.6) before calling its API route. */
export function ConfirmDialog({ title, sendMessage, message, confirmLabel = 'Yes, send', cancelLabel = 'Cancel', onConfirm, onCancel, danger }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-t-card border border-light-gray bg-dark-gray p-5 sm:rounded-card">
        <p className="font-display text-lg font-bold text-white">{title}</p>
        {message && <p className="mt-2 text-sm text-medium-gray">{message}</p>}
        {sendMessage && (
          <div className="mt-3 rounded-card border border-light-gray bg-black p-3">
            <p className="text-xs uppercase tracking-wide text-medium-gray">This will send:</p>
            <p className="mt-1 text-sm text-white">&ldquo;{sendMessage}&rdquo;</p>
          </div>
        )}
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="h-12 flex-1" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            className={`h-12 flex-1 ${danger ? 'bg-red-500 text-white' : ''}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Sending…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
