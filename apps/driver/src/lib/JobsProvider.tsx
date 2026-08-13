import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { withRetry } from './retry';
import { useToast } from './ToastProvider';
import type { JobOfferSummary, ReservationJob } from './types';

interface JobsContextValue {
  jobs: ReservationJob[];
  pendingOffers: JobOfferSummary[];
  loaded: boolean;
  refetch: () => Promise<void>;
  patchJob: (reservationId: string, patch: Partial<ReservationJob>) => void;
}

const JobsContext = createContext<JobsContextValue | null>(null);

export function useJobs(): JobsContextValue {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used within JobsProvider');
  return ctx;
}

const POLL_MS = 6000; // matches apps/web's ValetQueuePage poll interval

/**
 * Hoisted above the tab navigator (unlike apps/web, where this lives inside
 * the queue page itself) so a new job offer can interrupt with the full-screen
 * alarm no matter which tab the driver is on — Home, Jobs, or Profile — the
 * way an incoming ride request would in a ride-share driver app.
 */
export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<ReservationJob[]>([]);
  const [pendingOffers, setPendingOffers] = useState<JobOfferSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { showToast } = useToast();
  const pollFailingRef = useRef(false);

  const refetch = useCallback(async () => {
    try {
      const data = await withRetry(() =>
        api.get<{ jobs: ReservationJob[]; pendingOffers: JobOfferSummary[] }>('/api/valet/jobs'),
      );
      setJobs(data.jobs ?? []);
      setPendingOffers(data.pendingOffers ?? []);
      if (pollFailingRef.current) {
        pollFailingRef.current = false;
        showToast('Job list back in sync', 'success');
      }
    } catch {
      // Once per outage, not once per 6s poll tick.
      if (!pollFailingRef.current) {
        pollFailingRef.current = true;
        showToast("Can't reach your job queue — retrying…", 'error');
      }
    } finally {
      setLoaded(true);
    }
  }, [showToast]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, POLL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  const patchJob = useCallback((reservationId: string, patch: Partial<ReservationJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === reservationId ? { ...j, ...patch } : j)));
  }, []);

  return (
    <JobsContext.Provider value={{ jobs, pendingOffers, loaded, refetch, patchJob }}>
      {children}
    </JobsContext.Provider>
  );
}
