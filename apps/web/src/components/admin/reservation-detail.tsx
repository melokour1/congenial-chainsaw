'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCents } from '@laxvaletcare/shared';
import { Card, Button, StatusBadge } from '@/components/ui';
import { ActionButton } from '@/components/admin/action-button';

interface Valet { id: string; fullName: string; valetStatus: string | null }
interface AddOn { id: string; type: string; priceCents: number; status: string; completedAt: string | null }
interface Photo { id: string; url: string; stage: string; takenByValet: { fullName: string } | null; createdAt: string }
interface ActivityLogEntry { id: string; action: string; detail: any; createdAt: string; actor: { fullName: string } | null }

interface ReservationFull {
  id: string;
  bookingCode: string;
  status: string;
  originType: string;
  departureDate: string;
  returnDateEstimate: string;
  departingAirline: string | null;
  departingFlightNumber: string | null;
  returningAirline: string | null;
  returningFlightNumber: string | null;
  bagsInfo: string | null;
  vehicleColor: string;
  vehicleMake: string;
  vehicleModel: string;
  transmission: string;
  plate: string | null;
  vehicleLocation: string | null;
  serviceTier: string;
  gratuityCents: number;
  priceBreakdown: { lineItems: { label: string; cents: number }[]; subtotalCents: number; taxCents: number; serviceFeeCents: number; gratuityCents: number; totalCents: number };
  totalCents: number;
  stripePaymentIntentId: string | null;
  notes: string | null;
  departureValetId: string | null;
  returnValetId: string | null;
  customer: { id: string; fullName: string; email: string; phone: string | null } | null;
  terminal: { code: string; name: string } | null;
  addOns: AddOn[];
  photos: Photo[];
  activityLogs: ActivityLogEntry[];
  rating: { stars: number; comment: string | null; tipCents: number } | null;
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '');
}

export function ReservationDetail({ reservation, valets }: { reservation: ReservationFull; valets: Valet[] }) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState({
    vehicleColor: reservation.vehicleColor,
    vehicleMake: reservation.vehicleMake,
    vehicleModel: reservation.vehicleModel,
    transmission: reservation.transmission,
    plate: reservation.plate ?? '',
    vehicleLocation: reservation.vehicleLocation ?? '',
  });
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [notes, setNotes] = useState(reservation.notes ?? '');
  const [notesSaving, setNotesSaving] = useState(false);
  const [departureValetId, setDepartureValetId] = useState(reservation.departureValetId ?? '');
  const [returnValetId, setReturnValetId] = useState(reservation.returnValetId ?? '');
  const [returnDate, setReturnDate] = useState(reservation.returnDateEstimate.slice(0, 16));
  const [showNotify, setShowNotify] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');
  const [showRefund, setShowRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/reservations/${reservation.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? 'Save failed');
      return false;
    }
    router.refresh();
    return true;
  }

  const phone = reservation.customer?.phone ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{reservation.bookingCode}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={reservation.status} />
            <span className="text-sm text-medium-gray">{reservation.serviceTier.replaceAll('_', ' ')}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="secondary" className="h-10 px-4 text-sm" onClick={() => setShowNotify((s) => !s)}>Send Notification</Button>
          <Button variant="secondary" className="h-10 px-4 text-sm" onClick={() => setShowRefund((s) => !s)}>Process Refund</Button>
          <Button variant="secondary" className="h-10 px-4 text-sm" onClick={() => window.print()}>Print</Button>
          <ActionButton
            label="Cancel"
            method="PATCH"
            url={`/api/reservations/${reservation.id}`}
            body={{ status: 'CANCELLED' }}
            confirmText="Cancel this reservation? This cannot be undone."
            variant="secondary"
          />
          <ActionButton
            label="[CLIENT CLOSE]"
            method="POST"
            url={`/api/reservations/${reservation.id}/close`}
            confirmText="Close this booking? A review request is sent automatically if the customer rated 4-5 stars."
            variant="primary"
            className="bg-gold text-black"
          />
        </div>
      </div>

      {showNotify && (
        <Card className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-bold text-white">Send Notification</h3>
          <input value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} placeholder="Title" className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white placeholder:text-medium-gray focus:outline-none" />
          <textarea value={notifyBody} onChange={(e) => setNotifyBody(e.target.value)} placeholder="Message" rows={3} className="rounded-card border border-light-gray/30 bg-transparent p-3 text-sm text-white placeholder:text-medium-gray focus:outline-none" />
          <div>
            <ActionButton
              label="Send"
              url="/api/admin/notify"
              body={{ profileId: reservation.customer?.id, title: notifyTitle, body: notifyBody, type: 'ADMIN_MESSAGE', reservationId: reservation.id }}
              variant="primary"
              disabled={!notifyTitle || !notifyBody}
              onDone={() => { setShowNotify(false); setNotifyTitle(''); setNotifyBody(''); }}
            />
          </div>
        </Card>
      )}

      {showRefund && (
        <Card className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-bold text-white">Process Refund</h3>
          <p className="text-xs text-medium-gray">Attempts a live Stripe refund if configured; otherwise logs the request to the activity log for manual processing.</p>
          <input value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="Amount in dollars (blank = full)" className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white placeholder:text-medium-gray focus:outline-none" />
          <textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Reason" rows={2} className="rounded-card border border-light-gray/30 bg-transparent p-3 text-sm text-white placeholder:text-medium-gray focus:outline-none" />
          <div>
            <ActionButton
              label="Submit Refund"
              url="/api/admin/refund"
              body={{ reservationId: reservation.id, amountCents: refundAmount ? Math.round(parseFloat(refundAmount) * 100) : undefined, reason: refundReason }}
              variant="primary"
              onDone={(json) => { alert(json.note); setShowRefund(false); }}
            />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-white">Customer</h2>
          {reservation.customer ? (
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-white">{reservation.customer.fullName}</span>
              <a href={`mailto:${reservation.customer.email}`} className="text-medium-gray hover:text-white">{reservation.customer.email}</a>
              {phone && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <a href={`tel:${phone}`} className="rounded-card border border-light-gray/30 px-3 py-2 text-xs text-white hover:bg-white/5">📞 Call</a>
                  <a href={`sms:${phone}`} className="rounded-card border border-light-gray/30 px-3 py-2 text-xs text-white hover:bg-white/5">💬 Text</a>
                  <a href={`https://wa.me/${digitsOnly(phone)}`} target="_blank" rel="noreferrer" className="rounded-card border border-light-gray/30 px-3 py-2 text-xs text-white hover:bg-white/5">🟢 WhatsApp</a>
                </div>
              )}
            </div>
          ) : <p className="text-sm text-medium-gray">No customer on record.</p>}
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-white">Trip info</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-medium-gray">Origin</span><span className="text-white">{reservation.originType}</span>
            <span className="text-medium-gray">Terminal</span><span className="text-white">{reservation.terminal?.name ?? '—'}</span>
            <span className="text-medium-gray">Departing flight</span><span className="text-white">{reservation.departingAirline ?? '—'} {reservation.departingFlightNumber ?? ''}</span>
            <span className="text-medium-gray">Returning flight</span><span className="text-white">{reservation.returningAirline ?? '—'} {reservation.returningFlightNumber ?? ''}</span>
            <span className="text-medium-gray">Bags</span><span className="text-white">{reservation.bagsInfo ?? '—'}</span>
            <span className="text-medium-gray">Departure date</span><span className="text-white">{new Date(reservation.departureDate).toLocaleString()}</span>
          </div>
          <div className="flex items-end gap-2 pt-2">
            <label className="flex flex-1 flex-col gap-1 text-xs text-medium-gray">
              Return date estimate (Extend Trip)
              <input type="datetime-local" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
            </label>
            <Button variant="secondary" className="h-11 px-4 text-sm" onClick={() => patch({ returnDateEstimate: new Date(returnDate).toISOString() })}>Save</Button>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Vehicle</h2>
          {reservation.transmission === 'MANUAL' && <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">⚠️ MANUAL</span>}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Field label="Color" value={vehicle.vehicleColor} onChange={(v) => setVehicle((s) => ({ ...s, vehicleColor: v }))} />
          <Field label="Make" value={vehicle.vehicleMake} onChange={(v) => setVehicle((s) => ({ ...s, vehicleMake: v }))} />
          <Field label="Model" value={vehicle.vehicleModel} onChange={(v) => setVehicle((s) => ({ ...s, vehicleModel: v }))} />
          <label className="flex flex-col gap-1 text-xs text-medium-gray">
            Transmission
            <select value={vehicle.transmission} onChange={(e) => setVehicle((s) => ({ ...s, transmission: e.target.value }))} className="h-11 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white">
              <option value="AUTOMATIC">Automatic</option>
              <option value="MANUAL">Manual</option>
            </select>
          </label>
          <Field label="Plate" value={vehicle.plate} onChange={(v) => setVehicle((s) => ({ ...s, plate: v }))} />
          <Field label="Location" value={vehicle.vehicleLocation} onChange={(v) => setVehicle((s) => ({ ...s, vehicleLocation: v }))} />
        </div>
        <div>
          <Button
            variant="secondary" className="h-10 px-4 text-sm"
            disabled={vehicleSaving}
            onClick={async () => { setVehicleSaving(true); await patch({ ...vehicle, plate: vehicle.plate || null, vehicleLocation: vehicle.vehicleLocation || null }); setVehicleSaving(false); }}
          >
            {vehicleSaving ? 'Saving…' : 'Save vehicle info'}
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-white">Service &amp; add-ons</h2>
        <div className="text-sm text-white">{reservation.serviceTier.replaceAll('_', ' ')}</div>
        {reservation.addOns.length > 0 ? (
          <div className="flex flex-col divide-y divide-light-gray/10">
            {reservation.addOns.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-white">{a.type.replaceAll('_', ' ')}</span>
                <div className="flex items-center gap-3">
                  <span className="text-medium-gray">{formatCents(a.priceCents)}</span>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-medium-gray">No add-ons.</p>}
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-white">Payment breakdown</h2>
        <div className="flex flex-col divide-y divide-light-gray/10 text-sm">
          {reservation.priceBreakdown?.lineItems?.map((li, i) => (
            <div key={i} className="flex justify-between py-1.5"><span className="text-medium-gray">{li.label}</span><span className="text-white">{formatCents(li.cents)}</span></div>
          ))}
          <div className="flex justify-between py-1.5"><span className="text-medium-gray">Tax</span><span className="text-white">{formatCents(reservation.priceBreakdown?.taxCents ?? 0)}</span></div>
          <div className="flex justify-between py-1.5"><span className="text-medium-gray">Service fee</span><span className="text-white">{formatCents(reservation.priceBreakdown?.serviceFeeCents ?? 0)}</span></div>
          <div className="flex justify-between py-1.5"><span className="text-medium-gray">Gratuity</span><span className="text-white">{formatCents(reservation.gratuityCents)}</span></div>
          <div className="flex justify-between py-2 text-base font-bold"><span className="text-white">Total</span><span className="text-white">{formatCents(reservation.totalCents)}</span></div>
        </div>
        <span className="text-xs text-medium-gray">Stripe PI: {reservation.stripePaymentIntentId ?? 'none'}</span>
        {reservation.rating && (
          <span className="text-xs text-medium-gray">Rating: {'⭐'.repeat(reservation.rating.stars)} {reservation.rating.comment ? `— "${reservation.rating.comment}"` : ''} {reservation.rating.tipCents ? `(tip ${formatCents(reservation.rating.tipCents)})` : ''}</span>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-white">Assigned valets</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-medium-gray">
            Departure valet
            <div className="flex gap-2">
              <select value={departureValetId} onChange={(e) => setDepartureValetId(e.target.value)} className="h-11 flex-1 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white">
                <option value="">Unassigned</option>
                {valets.map((v) => <option key={v.id} value={v.id}>{v.fullName}</option>)}
              </select>
              <Button variant="secondary" className="h-11 px-3 text-sm" onClick={() => patch({ departureValetId: departureValetId || null })}>Save</Button>
            </div>
          </label>
          <label className="flex flex-col gap-1 text-xs text-medium-gray">
            Return valet
            <div className="flex gap-2">
              <select value={returnValetId} onChange={(e) => setReturnValetId(e.target.value)} className="h-11 flex-1 rounded-card border border-light-gray/30 bg-black px-3 text-sm text-white">
                <option value="">Unassigned</option>
                {valets.map((v) => <option key={v.id} value={v.id}>{v.fullName}</option>)}
              </select>
              <Button variant="secondary" className="h-11 px-3 text-sm" onClick={() => patch({ returnValetId: returnValetId || null })}>Save</Button>
            </div>
          </label>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-white">Photos</h2>
        {reservation.photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {reservation.photos.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="flex flex-col gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.stage} className="aspect-square w-full rounded-card object-cover" />
                <span className="text-xs text-medium-gray">{p.stage} — {p.takenByValet?.fullName ?? 'unknown'}</span>
              </a>
            ))}
          </div>
        ) : <p className="text-sm text-medium-gray">No photos yet.</p>}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-white">Notes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="rounded-card border border-light-gray/30 bg-transparent p-3 text-sm text-white focus:outline-none" />
        <div>
          <Button
            variant="secondary" className="h-10 px-4 text-sm" disabled={notesSaving}
            onClick={async () => { setNotesSaving(true); await patch({ notes }); setNotesSaving(false); }}
          >
            {notesSaving ? 'Saving…' : 'Save notes'}
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-bold text-white">Activity log</h2>
        <div className="flex flex-col divide-y divide-light-gray/10 text-sm">
          {reservation.activityLogs.length === 0 && <p className="py-2 text-medium-gray">No activity yet.</p>}
          {[...reservation.activityLogs].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2">
              <span className="text-white">{a.action}{a.actor?.fullName ? ` — ${a.actor.fullName}` : ''}</span>
              <span className="text-xs text-medium-gray">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-medium-gray">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-card border border-light-gray/30 bg-transparent px-3 text-sm text-white focus:outline-none" />
    </label>
  );
}
