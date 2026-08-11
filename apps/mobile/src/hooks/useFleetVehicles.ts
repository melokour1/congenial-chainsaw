import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { FleetVehicle } from '../lib/types';

/** Public-read reference data — fetched directly via supabase-js per the spec (no server round trip needed). */
export function useFleetVehicles() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(
      supabase.from('fleet_vehicles').select('*').eq('status', 'AVAILABLE').order('dailyRateCents', { ascending: true }),
    )
      .then(({ data }) => {
        if (!cancelled) setVehicles((data as FleetVehicle[]) ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byClass = vehicles.reduce<Record<string, FleetVehicle[]>>((acc, v) => {
    (acc[v.class] ??= []).push(v);
    return acc;
  }, {});

  return { vehicles, byClass, loading };
}
