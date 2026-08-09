'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { ActionButton } from '@/components/admin/action-button';

interface Rental {
  id: string;
  bookingCode: string;
  pickupDate: string;
  insuranceOption: string;
  insurancePlan: string | null;
  insuranceCompany: string | null;
  insurancePolicyNumber: string | null;
  insuranceCardFrontUrl: string | null;
  insuranceCardBackUrl: string | null;
  customer: { id: string; fullName: string; email: string; phone: string | null } | null;
  fleetVehicle: { make: string; model: string; year: number } | null;
}

export function InsuranceReviewList({ rentals }: { rentals: Rental[] }) {
  const [openId, setOpenId] = useState<string | null>(rentals[0]?.id ?? null);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const now = Date.now();

  return (
    <div className="flex flex-col gap-4">
      {rentals.length === 0 && <p className="text-sm text-medium-gray">No pending insurance reviews.</p>}
      {rentals.map((r) => {
        const urgent = new Date(r.pickupDate).getTime() - now < 6 * 60 * 60 * 1000;
        const open = openId === r.id;
        return (
          <Card key={r.id} className="flex flex-col gap-3">
            <button className="flex w-full items-center justify-between text-left" onClick={() => setOpenId(open ? null : r.id)}>
              <div className="flex items-center gap-3">
                {urgent && <span className="rounded-full bg-gold/15 px-2 py-1 text-xs font-medium text-gold">⚠️ URGENT</span>}
                <span className="font-medium text-white">{r.bookingCode}</span>
                <span className="text-sm text-medium-gray">{r.customer?.fullName ?? 'Unknown customer'}</span>
                <span className="text-sm text-medium-gray">{r.fleetVehicle ? `${r.fleetVehicle.year} ${r.fleetVehicle.make} ${r.fleetVehicle.model}` : ''}</span>
              </div>
              <span className="text-sm text-medium-gray">Pickup {new Date(r.pickupDate).toLocaleString()} {open ? '▲' : '▼'}</span>
            </button>

            {open && (
              <div className="flex flex-col gap-4 border-t border-light-gray/10 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2 text-sm">
                    <span className="text-medium-gray">Insurance option: <span className="text-white">{r.insuranceOption === 'OWN' ? 'Own policy' : `LAXValetCare plan (${r.insurancePlan})`}</span></span>
                    {r.insuranceOption === 'OWN' && (
                      <>
                        <span className="text-medium-gray">Company: <span className="text-white">{r.insuranceCompany ?? '—'}</span></span>
                        <span className="text-medium-gray">Policy #: <span className="text-white">{r.insurancePolicyNumber ?? '—'}</span></span>
                      </>
                    )}
                    {r.customer && (
                      <>
                        <span className="text-medium-gray">Customer: <span className="text-white">{r.customer.fullName}</span></span>
                        <a href={`mailto:${r.customer.email}`} className="text-medium-gray hover:text-white">{r.customer.email}</a>
                        {r.customer.phone && <a href={`tel:${r.customer.phone}`} className="text-medium-gray hover:text-white">{r.customer.phone}</a>}
                      </>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {r.insuranceCardFrontUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <a href={r.insuranceCardFrontUrl} target="_blank" rel="noreferrer"><img src={r.insuranceCardFrontUrl} alt="Insurance card front" className="h-32 w-auto rounded-card object-cover" /></a>
                    )}
                    {r.insuranceCardBackUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <a href={r.insuranceCardBackUrl} target="_blank" rel="noreferrer"><img src={r.insuranceCardBackUrl} alt="Insurance card back" className="h-32 w-auto rounded-card object-cover" /></a>
                    )}
                    {!r.insuranceCardFrontUrl && !r.insuranceCardBackUrl && <span className="text-sm text-medium-gray">No card images uploaded.</span>}
                  </div>
                </div>

                <textarea
                  value={reasons[r.id] ?? ''}
                  onChange={(e) => setReasons((s) => ({ ...s, [r.id]: e.target.value }))}
                  placeholder="Rejection reason (required to reject)"
                  rows={2}
                  className="rounded-card border border-light-gray/30 bg-transparent p-3 text-sm text-white placeholder:text-medium-gray focus:outline-none"
                />

                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    label="Approve"
                    method="PATCH"
                    url={`/api/rentals/${r.id}/insurance`}
                    body={{ decision: 'APPROVED' }}
                    variant="primary"
                  />
                  <ActionButton
                    label="Reject"
                    method="PATCH"
                    url={`/api/rentals/${r.id}/insurance`}
                    body={() => ({ decision: 'REJECTED', reason: reasons[r.id] || 'Insurance information could not be verified.' })}
                    variant="secondary"
                  />
                  {r.customer && (
                    <a href={`mailto:${r.customer.email}?subject=${encodeURIComponent(`Insurance info needed — ${r.bookingCode}`)}`} className="inline-flex h-10 items-center rounded-card border border-light-gray/30 px-4 text-sm font-medium text-white hover:bg-white/5">
                      Message customer
                    </a>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
