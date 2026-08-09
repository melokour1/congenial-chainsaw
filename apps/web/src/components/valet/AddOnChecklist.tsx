'use client';

import { useState } from 'react';
import type { AddOn, ReservationJob } from './types';
import { ADD_ON_LABEL } from './actionCopy';
import { ConfirmDialog } from './ConfirmDialog';
import { PhotoCaptureSheet } from './PhotoCaptureSheet';

/** Collapsible "▼ Service updates" checklist — only the add-ons actually on this reservation (spec 4.5). */
export function AddOnChecklist({ reservation, readOnly, onCompleted }: { reservation: ReservationJob; readOnly?: boolean; onCompleted: (addOnId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<AddOn | null>(null);
  const [step, setStep] = useState<'confirm' | 'photos' | null>(null);

  if (reservation.addOns.length === 0) return null;

  const startFlow = (addOn: AddOn) => {
    if (readOnly || addOn.status === 'COMPLETE') return;
    setPending(addOn);
    setStep('confirm');
  };

  const finish = async (photoUrls: string[]) => {
    if (!pending) return;
    await fetch(`/api/valet/addons/${pending.id}/complete`, { method: 'POST' });
    onCompleted(pending.id);
    setPending(null);
    setStep(null);
  };

  return (
    <div className="rounded-card border border-light-gray">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-white"
      >
        <span>{open ? '▼' : '▶'} Service updates</span>
        <span className="text-medium-gray">
          {reservation.addOns.filter((a) => a.status === 'COMPLETE').length}/{reservation.addOns.length} done
        </span>
      </button>
      {open && (
        <ul className="space-y-1 border-t border-light-gray p-3">
          {reservation.addOns.map((addOn) => (
            <li key={addOn.id}>
              <button
                type="button"
                onClick={() => startFlow(addOn)}
                disabled={readOnly || addOn.status === 'COMPLETE'}
                className="flex w-full items-center justify-between rounded-card px-2 py-2 text-sm disabled:opacity-70"
              >
                <span className="text-white">{ADD_ON_LABEL[addOn.type] ?? addOn.type}</span>
                <span className={addOn.status === 'COMPLETE' ? 'text-green-400' : 'text-medium-gray'}>
                  {addOn.status === 'COMPLETE' ? '✓ Complete' : 'Mark complete'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {pending && step === 'confirm' && (
        <ConfirmDialog
          title={`Complete ${ADD_ON_LABEL[pending.type] ?? pending.type}?`}
          sendMessage={`Your ${ADD_ON_LABEL[pending.type] ?? pending.type} is complete ✨`}
          onConfirm={() => setStep('photos')}
          onCancel={() => { setPending(null); setStep(null); }}
        />
      )}

      {pending && step === 'photos' && (
        <PhotoCaptureSheet
          title={`${ADD_ON_LABEL[pending.type] ?? pending.type} — photos`}
          minPhotos={1}
          stage="ADDON"
          reservationId={reservation.id}
          onDone={finish}
          onCancel={() => { setPending(null); setStep(null); }}
        />
      )}
    </div>
  );
}
