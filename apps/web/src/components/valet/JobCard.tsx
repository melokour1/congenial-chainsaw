'use client';

import { useState } from 'react';
import { formatCents, OFF_SITE_ORIGINS } from '@laxvaletcare/shared';
import { Card, StatusBadge } from '@/components/ui';
import type { Assignment, ReservationJob } from './types';
import { ACTION_COPY, ActionType, DEPARTURE_SEQUENCE, RETURN_SEQUENCE } from './actionCopy';
import { VehicleInfoEditor } from './VehicleInfoEditor';
import { AddOnChecklist } from './AddOnChecklist';
import { ConfirmDialog } from './ConfirmDialog';
import { PhotoCaptureSheet } from './PhotoCaptureSheet';

const ETA_LABEL: Record<string, string> = {
  UNDER_15: 'under 15 min',
  MIN_15_30: '15–30 min',
  MIN_30_45: '30–45 min',
  PLUS_45: '45+ min',
};

const STATUS_PHRASE: Record<string, string> = {
  LIVE: 'Heading to Terminal',
  CHECKED_IN: 'Vehicle parked',
  DELIVERING: 'Heading with vehicle',
  DELIVERED_PENDING_CLOSE: 'Delivered',
};

function fmtDate(d: string) {
  return new Date(d).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

interface JobCardProps {
  assignment: Assignment;
  meId: string;
  readOnly: boolean;
  onChange: (reservationId: string, patch: Partial<ReservationJob>) => void;
}

export function JobCard({ assignment, meId, readOnly, onChange }: JobCardProps) {
  const { type, reservation: r } = assignment;
  const [flow, setFlow] = useState<{ action: ActionType; phase: 'photos' | 'confirm' } | null>(null);
  const [markingLanded, setMarkingLanded] = useState(false);

  const isDeparture = type === 'DEPARTURE';
  const assignedValetId = isDeparture ? r.departureValetId : r.returnValetId;
  const assignedValet = isDeparture ? r.departureValet : r.returnValet;

  // Defensive: shouldn't normally happen (this endpoint only returns the caller's own jobs),
  // but if the reservation got reassigned mid-session, render read-only per spec point 6.
  if (assignedValetId && assignedValetId !== meId) {
    const statusPhrase = STATUS_PHRASE[r.status] ?? r.status.replaceAll('_', ' ');
    return (
      <Card className="border border-light-gray">
        <p className="text-sm font-medium text-green-400">
          🟢 HANDLED BY {assignedValet?.fullName ?? 'another valet'} — {statusPhrase} at Terminal {r.terminal?.code ?? '—'}
        </p>
        <p className="mt-1 text-xs text-medium-gray">{r.vehicleColor} {r.vehicleMake} {r.vehicleModel} · Booking {r.bookingCode}</p>
      </Card>
    );
  }

  const sequence = isDeparture ? DEPARTURE_SEQUENCE : RETURN_SEQUENCE;
  const doneActions = new Set(r.activityLogs.filter((l) => sequence.includes(l.action as ActionType)).map((l) => l.action));
  const nextAction = sequence.find((a) => !doneActions.has(a)) ?? null;

  const pickupPhotoCount = r.photos.filter((p) => p.stage === 'PICKUP').length;
  const returnPhotoCount = r.photos.filter((p) => p.stage === 'RETURN').length;

  const offSiteOrigin = r.originType !== 'LAX' ? OFF_SITE_ORIGINS.find((o) => o.type === r.originType) : null;

  const startAction = (action: ActionType) => {
    if (readOnly) return;
    if (action === 'VEHICLE_RECEIVED' && pickupPhotoCount < 4) {
      setFlow({ action, phase: 'photos' });
    } else if (action === 'HEADING_WITH_VEHICLE' && returnPhotoCount < 4) {
      setFlow({ action, phase: 'photos' });
    } else {
      setFlow({ action, phase: 'confirm' });
    }
  };

  const runAction = async (action: ActionType) => {
    const res = await fetch(`/api/reservations/${r.id}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const data = await res.json();
      onChange(r.id, {
        status: data.status,
        activityLogs: [...r.activityLogs, { id: crypto.randomUUID(), reservationId: r.id, actorId: meId, action, detail: null, createdAt: new Date().toISOString() }],
      });
    }
    setFlow(null);
  };

  const markFlightLanded = async () => {
    setMarkingLanded(true);
    try {
      const flightLandedAt = new Date().toISOString();
      const res = await fetch(`/api/reservations/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightLandedAt }),
      });
      if (res.ok) onChange(r.id, { flightLandedAt });
    } finally {
      setMarkingLanded(false);
    }
  };

  return (
    <Card className="border border-light-gray">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">{isDeparture ? 'Departure' : 'Return'}</p>
          <p className="font-display text-base font-bold text-white">{r.vehicleColor} {r.vehicleMake} {r.vehicleModel}</p>
          <p className="text-xs text-medium-gray">{isDeparture ? fmtDate(r.departureDate) : fmtDate(r.returnDateEstimate)}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      {isDeparture && r.customerOnWayAt && (
        <div className="mb-2 rounded-card bg-blue-500/15 px-3 py-2 text-sm text-blue-300">
          🚗 Customer on the way{r.customerEtaMinutes ? ` — ETA ${r.customerEtaMinutes} min` : r.customerEtaBand ? ` — ETA ${ETA_LABEL[r.customerEtaBand]}` : ''}
        </div>
      )}

      {!isDeparture && r.flightLandedAt && !r.customerAtCurbAt && (
        <div className="mb-2 rounded-card bg-orange-500/15 px-3 py-2 text-sm font-semibold text-orange-300">
          🟠 FLIGHT LANDED
        </div>
      )}
      {!isDeparture && r.customerAtCurbAt && (
        <div className="mb-2 rounded-card bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-300">
          🔴 AT THE CURB {r.curbLocationDetail ? `— ${r.curbLocationDetail}` : ''}
        </div>
      )}
      {!isDeparture && !r.flightLandedAt && !readOnly && (
        <button
          onClick={markFlightLanded}
          disabled={markingLanded}
          className="mb-2 w-full rounded-card border border-light-gray py-2 text-xs font-medium text-medium-gray"
        >
          {markingLanded ? 'Marking…' : 'Mark flight landed'}
        </button>
      )}

      {offSiteOrigin && (
        <div className="mb-2 rounded-card bg-yellow-500/15 px-3 py-2 text-sm text-yellow-300">
          ⚠️ Off-site pickup — {offSiteOrigin.name}, {offSiteOrigin.address}
        </div>
      )}

      <div className="mb-3 space-y-1 rounded-card border border-light-gray bg-black p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{r.customer.fullName}</span>
          <div className="flex gap-3 text-xs">
            {r.customer.phone && <a href={`tel:${r.customer.phone}`} className="text-gold">Call</a>}
            {r.customer.phone && <a href={`sms:${r.customer.phone}`} className="text-gold">Text</a>}
            <a href={`mailto:${r.customer.email}`} className="text-gold">Email</a>
          </div>
        </div>
        <p className="text-xs text-medium-gray">Booking {r.bookingCode} · {r.serviceTier.replace('_', ' ')}</p>
        <p className="text-xs text-medium-gray">
          {isDeparture
            ? `${r.departingAirline ?? '—'} ${r.departingFlightNumber ?? ''}`
            : `${r.returningAirline ?? '—'} ${r.returningFlightNumber ?? ''}`}
          {' · '}Terminal {r.terminal?.code ?? '—'}
        </p>
        {r.bagsInfo && <p className="text-xs text-medium-gray">Bags: {r.bagsInfo}</p>}
        <p className="text-xs text-medium-gray">Gratuity: {formatCents(r.gratuityCents)}</p>
      </div>

      <div className="mb-3">
        <VehicleInfoEditor reservation={r} readOnly={readOnly} onSaved={(patch) => onChange(r.id, patch)} />
      </div>

      <AddOnChecklist
        reservation={r}
        readOnly={readOnly}
        onCompleted={(addOnId) => onChange(r.id, {
          addOns: r.addOns.map((a) => (a.id === addOnId ? { ...a, status: 'COMPLETE', completedAt: new Date().toISOString() } : a)),
        })}
      />

      {!readOnly && (
        <div className="mt-3 space-y-2">
          {sequence.map((action) => {
            const done = doneActions.has(action);
            const isNext = action === nextAction;
            const copy = ACTION_COPY[action];
            return (
              <button
                key={action}
                onClick={() => isNext && startAction(action)}
                disabled={!isNext}
                className={`flex h-14 w-full items-center justify-center gap-2 rounded-card font-display text-sm font-bold ${
                  done
                    ? 'border border-green-500/40 bg-green-500/10 text-green-400'
                    : isNext
                    ? 'bg-white text-black'
                    : 'bg-dark-gray text-medium-gray opacity-50'
                }`}
              >
                {done ? '✓ ' : action === 'VEHICLE_RECEIVED' || action === 'HEADING_WITH_VEHICLE' ? '📸 ' : ''}
                {copy.buttonLabel}
              </button>
            );
          })}
        </div>
      )}

      {readOnly && <p className="mt-3 text-center text-xs text-medium-gray">Read-only — future day</p>}

      {flow?.phase === 'photos' && (
        <PhotoCaptureSheet
          title={flow.action === 'VEHICLE_RECEIVED' ? 'Pickup photos (4+ required)' : 'Return photos — take before heading out (4+ required)'}
          minPhotos={4}
          stage={flow.action === 'VEHICLE_RECEIVED' ? 'PICKUP' : 'RETURN'}
          reservationId={r.id}
          onDone={(urls) => {
            onChange(r.id, {
              photos: [
                ...r.photos,
                ...urls.map((url) => ({ id: crypto.randomUUID(), reservationId: r.id, url, stage: (flow.action === 'VEHICLE_RECEIVED' ? 'PICKUP' : 'RETURN') as 'PICKUP' | 'RETURN', takenByValetId: meId, createdAt: new Date().toISOString() })),
              ],
            });
            setFlow({ action: flow.action, phase: 'confirm' });
          }}
          onCancel={() => setFlow(null)}
        />
      )}

      {flow?.phase === 'confirm' && (
        <ConfirmDialog
          title={ACTION_COPY[flow.action].confirmTitle}
          sendMessage={ACTION_COPY[flow.action].body(r)}
          message={flow.action === 'AT_CURBSIDE_RETURN' ? 'The return photos you took earlier will be shown to the customer now.' : undefined}
          onConfirm={() => runAction(flow.action)}
          onCancel={() => setFlow(null)}
        />
      )}
    </Card>
  );
}
