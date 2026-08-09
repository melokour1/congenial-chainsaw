import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthProvider';
import type { Reservation } from '../lib/types';

export function useReservations() {
  const { session } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session) {
      setReservations([]);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await api.get<Reservation[]>('/api/reservations');
      setReservations(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reservations, loading, error, refresh };
}

const ACTIVE_STATUSES = new Set([
  'CONFIRMED',
  'LIVE',
  'CHECKED_IN',
  'IN_TRIP',
  'RETURN_REQUESTED',
  'DELIVERING',
  'DELIVERED_PENDING_CLOSE',
  'UPDATED',
]);

export function isActiveReservation(r: Reservation) {
  return ACTIVE_STATUSES.has(r.status);
}
