'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DeliveryMethod, PriceBreakdown, PricingConfig } from '@laxvaletcare/shared';
import { calcRentalPrice, formatCents } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/client';
import { Button, Card } from '@/components/ui';
import { InlineAuthGate } from '@/components/site/inline-auth-gate';
import { toLocalInputValue, isoFromLocalInput } from '@/components/site/lib/format';

interface FleetVehicle {
  id: string;
  class: string;
  make: string;
  model: string;
  year: number;
  color: string;
  dailyRateCents: number;
  status: string;
}

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string }[] = [
  { value: 'LOT', label: 'Pick up at our lot' },
  { value: 'LAX', label: 'Delivered to LAX' },
  { value: 'HOME', label: 'Delivered to my address' },
];

export default function BookRentPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('LOT');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bookingCode: string; needsVerification: boolean } | null>(null);

  useEffect(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    setPickupDate(toLocalInputValue(now));
    setReturnDate(toLocalInputValue(later));

    const supabase = createClient();
    Promise.all([
      supabase.from('fleet_vehicles').select('*').eq('status', 'AVAILABLE').order('dailyRateCents', { ascending: true }),
      fetch('/api/pricing').then((res) => res.json()),
      supabase.auth.getUser(),
    ]).then(([fleetRes, pricingJson, userRes]) => {
      setVehicles((fleetRes.data as FleetVehicle[]) ?? []);
      setPricing(pricingJson);
      setSignedIn(!!userRes.data.user);
      if (fleetRes.data?.length) setSelectedId(fleetRes.data[0].id);
      setLoading(false);
    });
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === selectedId) ?? null;

  const breakdown = useMemo<PriceBreakdown | null>(() => {
    if (!pricing || !selectedVehicle || !pickupDate || !returnDate) return null;
    try {
      return calcRentalPrice(
        {
          pickupDate: new Date(pickupDate),
          returnDate: new Date(returnDate),
          rentalClass: selectedVehicle.class as any,
          deliveryMethod,
          insurance: { option: 'OWN' },
        },
        pricing,
      );
    } catch {
      return null;
    }
  }, [pricing, selectedVehicle, pickupDate, returnDate, deliveryMethod]);

  async function handleSubmit() {
    if (!selectedVehicle) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const pickupIso = isoFromLocalInput(pickupDate);
      const returnIso = isoFromLocalInput(returnDate);
      if (!pickupIso || !returnIso) throw new Error('Please provide valid pickup and return dates.');
      if (deliveryMethod === 'HOME' && !deliveryAddress.trim()) throw new Error('Please provide a delivery address.');

      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fleetVehicleId: selectedVehicle.id,
          pickupDate: pickupIso,
          returnDate: returnIso,
          deliveryMethod,
          deliveryAddress: deliveryMethod === 'HOME' ? deliveryAddress : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Something went wrong' }));
        throw new Error(typeof err.error === 'string' ? err.error : 'Could not create booking — please check your details.');
      }
      const json = await res.json();
      setResult({ bookingCode: json.bookingCode, needsVerification: json.needsVerification });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-content px-4 py-16 text-sm text-medium-gray sm:px-6">Loading vehicles…</div>;
  }

  if (result) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <Card className="border border-light-gray dark:border-[#2A2A2A]">
          <h1 className="font-display text-2xl font-bold">Booking requested 🎉</h1>
          <p className="mt-2 text-sm text-medium-gray">
            Confirmation code <span className="font-medium text-black dark:text-white">{result.bookingCode}</span>
          </p>
          {result.needsVerification && (
            <p className="mt-4 text-sm text-medium-gray">
              We&rsquo;ll follow up by email with next steps to verify your license before pickup.
            </p>
          )}
          <p className="mt-4 text-sm text-medium-gray">
            Track this rental any time from <a href="/account/activity" className="underline">My activity</a>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Rent a vehicle</h1>
      <p className="mt-2 text-medium-gray">Pick a vehicle, your dates, and how you&rsquo;d like it delivered.</p>

      {vehicles.length === 0 ? (
        <p className="mt-10 text-sm text-medium-gray">No vehicles available right now — check back soon.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold">Choose a vehicle</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={`rounded-card border p-4 text-left transition-colors ${
                    selectedId === v.id
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-light-gray dark:border-[#2A2A2A]'
                  }`}
                >
                  <div className="text-xs font-medium uppercase opacity-70">{v.class}</div>
                  <div className="mt-1 font-display font-bold">{v.year} {v.make} {v.model}</div>
                  <div className="mt-1 text-sm opacity-70">{v.color}</div>
                  <div className="mt-2 text-sm font-medium">{formatCents(v.dailyRateCents)} / day</div>
                </button>
              ))}
            </div>

            <h2 className="mt-8 font-display text-lg font-bold">Dates</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Pickup
                <input
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Return
                <input
                  type="datetime-local"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="min-h-[48px] rounded-card border border-light-gray bg-transparent px-3 text-sm font-normal dark:border-[#2A2A2A]"
                />
              </label>
            </div>

            <h2 className="mt-8 font-display text-lg font-bold">Delivery</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {DELIVERY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDeliveryMethod(opt.value)}
                  className={`min-h-[48px] flex-1 rounded-card border px-3 text-sm font-medium ${
                    deliveryMethod === opt.value
                      ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-light-gray dark:border-[#2A2A2A]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {deliveryMethod === 'HOME' && (
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery address"
                className="mt-3 min-h-[48px] w-full rounded-card border border-light-gray bg-transparent px-3 text-sm dark:border-[#2A2A2A]"
              />
            )}
          </div>

          <div>
            <h2 className="font-display text-lg font-bold">Price</h2>
            <Card className="mt-4 border border-light-gray dark:border-[#2A2A2A]">
              {breakdown ? (
                <>
                  <ul className="flex flex-col gap-2">
                    {breakdown.lineItems.map((li, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className="text-medium-gray">{li.label}</span>
                        <span>{formatCents(li.cents)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-light-gray pt-3 text-sm dark:border-[#2A2A2A]">
                    <div className="flex justify-between text-medium-gray">
                      <span>Tax</span>
                      <span>{formatCents(breakdown.taxCents)}</span>
                    </div>
                    <div className="flex justify-between text-medium-gray">
                      <span>Service fee</span>
                      <span>{formatCents(breakdown.serviceFeeCents)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-light-gray pt-3 font-display text-lg font-bold dark:border-[#2A2A2A]">
                    <span>Total</span>
                    <span>{formatCents(breakdown.totalCents)}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-medium-gray">Pick a vehicle and dates to see pricing.</p>
              )}
            </Card>

            {signedIn === false ? (
              <div className="mt-4">
                <InlineAuthGate onSignedIn={() => setSignedIn(true)} />
              </div>
            ) : (
              <>
                {submitError && <p className="mt-4 text-sm text-red-500">{submitError}</p>}
                <Button
                  variant="primary"
                  className="mt-4 h-12 w-full"
                  disabled={submitting || !breakdown}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Booking…' : 'Confirm rental'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
