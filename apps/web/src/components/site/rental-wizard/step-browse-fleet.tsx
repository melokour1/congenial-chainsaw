'use client';

import { useEffect, useState } from 'react';
import { formatCents, type RentalClass } from '@laxvaletcare/shared';
import { createClient } from '@/lib/supabase/client';
import { Button, Card } from '@/components/ui';
import { PhotoPlaceholder } from '@/components/site/photo-placeholder';
import type { FleetVehicleRow, RentalWizardData } from './types';

const CLASS_ORDER: RentalClass[] = ['ECONOMY', 'STANDARD', 'SUV', 'PREMIUM', 'LUXURY', 'VAN'];
const CLASS_LABEL: Record<RentalClass, string> = {
  ECONOMY: 'Economy',
  STANDARD: 'Standard',
  SUV: 'SUV',
  PREMIUM: 'Premium',
  LUXURY: 'Luxury',
  VAN: 'Van',
};

export function StepBrowseFleet({
  data,
  update,
  onNext,
  onBack,
}: {
  data: RentalWizardData;
  update: (patch: Partial<RentalWizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [vehicles, setVehicles] = useState<FleetVehicleRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('fleet_vehicles')
      .select('*')
      .eq('status', 'AVAILABLE')
      .order('dailyRateCents', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) setError(err.message);
        else setVehicles((rows as FleetVehicleRow[]) ?? []);
      });
  }, []);

  const grouped = CLASS_ORDER.map((cls) => ({
    cls,
    vehicles: (vehicles ?? []).filter((v) => v.class === cls),
  })).filter((g) => g.vehicles.length > 0);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Choose a vehicle</h2>
      <p className="mt-1 text-sm text-medium-gray">Our current fleet, grouped by class.</p>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {!vehicles && !error && <p className="mt-4 text-sm text-medium-gray">Loading fleet…</p>}
      {vehicles && vehicles.length === 0 && (
        <p className="mt-4 text-sm text-medium-gray">No vehicles are available right now — please check back soon.</p>
      )}

      <div className="mt-6 flex flex-col gap-8">
        {grouped.map((group) => (
          <div key={group.cls}>
            <h3 className="font-display text-lg font-bold">{CLASS_LABEL[group.cls]}</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.vehicles.map((v) => {
                const active = data.fleetVehicleId === v.id;
                return (
                  <Card
                    key={v.id}
                    onClick={() => update({ fleetVehicleId: v.id })}
                    className={`cursor-pointer border transition-colors ${active ? 'border-black dark:border-white' : 'border-light-gray dark:border-[#2A2A2A]'}`}
                  >
                    <PhotoPlaceholder label={`${v.year} ${v.make} ${v.model} in ${v.color}`} aspect="aspect-[4/3]" />
                    <h4 className="mt-3 font-display text-base font-bold">
                      {v.make} {v.model}
                    </h4>
                    <p className="text-xs text-medium-gray">
                      {v.year} · {v.color} · {v.mileage.toLocaleString()} mi
                    </p>
                    <p className="mt-2 text-sm font-semibold">{formatCents(v.dailyRateCents)}/day</p>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" className="h-12 px-8" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" className="h-12 px-8" onClick={onNext} disabled={!data.fleetVehicleId}>
          Continue
        </Button>
      </div>
    </div>
  );
}
