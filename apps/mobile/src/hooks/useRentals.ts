import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthProvider';
import type { RentalBooking } from '../lib/types';

export function useRentals() {
  const { session } = useAuth();
  const [rentals, setRentals] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) {
      setRentals([]);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await api.get<RentalBooking[]>('/api/rentals');
      setRentals(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rentals');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rentals, loading, error, refresh };
}

const ACTIVE_STATUSES = new Set(['PENDING_VERIFICATION', 'PENDING_INSURANCE', 'READY', 'PICKED_UP', 'OVERDUE']);

export function isActiveRental(r: RentalBooking) {
  return ACTIVE_STATUSES.has(r.status);
}
