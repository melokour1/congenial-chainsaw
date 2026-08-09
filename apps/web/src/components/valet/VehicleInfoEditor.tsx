'use client';

import { useState } from 'react';
import type { ReservationJob } from './types';

interface VehicleInfoEditorProps {
  reservation: ReservationJob;
  readOnly?: boolean;
  onSaved: (patch: Partial<ReservationJob>) => void;
}

type Field = 'vehicleColor' | 'vehicleMake' | 'vehicleModel' | 'transmission' | 'plate' | 'vehicleLocation';

const FIELD_LABEL: Record<Field, string> = {
  vehicleColor: 'Color',
  vehicleMake: 'Make',
  vehicleModel: 'Model',
  transmission: 'Transmission',
  plate: 'Plate',
  vehicleLocation: 'Location',
};

/** All vehicle fields, inline-editable per spec 4.5 — PATCH /api/reservations/[id] on save. */
export function VehicleInfoEditor({ reservation, readOnly, onSaved }: VehicleInfoEditorProps) {
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (field: Field) => {
    if (readOnly) return;
    setEditingField(field);
    setDraft(String(reservation[field] ?? ''));
  };

  const save = async (field: Field) => {
    setSaving(true);
    try {
      const value = field === 'transmission' ? draft : draft.trim();
      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) onSaved({ [field]: value } as Partial<ReservationJob>);
    } finally {
      setSaving(false);
      setEditingField(null);
    }
  };

  const fields: Field[] = ['vehicleColor', 'vehicleMake', 'vehicleModel', 'transmission', 'plate', 'vehicleLocation'];

  return (
    <div className="grid grid-cols-2 gap-2">
      {fields.map((field) => (
        <div key={field} className="rounded-card border border-light-gray bg-black p-2">
          <p className="text-[10px] uppercase tracking-wide text-medium-gray">{FIELD_LABEL[field]}</p>
          {editingField === field ? (
            field === 'transmission' ? (
              <select
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => save(field)}
                className="mt-0.5 w-full rounded bg-dark-gray text-sm text-white outline-none"
              >
                <option value="AUTOMATIC">AUTOMATIC</option>
                <option value="MANUAL">MANUAL</option>
              </select>
            ) : (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => save(field)}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                disabled={saving}
                className="mt-0.5 w-full rounded bg-dark-gray text-sm text-white outline-none"
              />
            )
          ) : (
            <button
              type="button"
              onClick={() => startEdit(field)}
              disabled={readOnly}
              className="mt-0.5 block w-full truncate text-left text-sm font-medium text-white disabled:opacity-100"
            >
              {String(reservation[field] ?? '—')}
              {field === 'transmission' && reservation.transmission === 'MANUAL' && ' ⚠️'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
