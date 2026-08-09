'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useValet } from '@/components/valet/ValetContext';
import { DateSelector, isSameDayAsOffset } from '@/components/valet/DateSelector';
import { JobCard } from '@/components/valet/JobCard';
import { JobAlarmModal } from '@/components/valet/JobAlarmModal';
import { assignmentNeedsAction } from '@/components/valet/actionCopy';
import type { Assignment, JobOfferSummary, ReservationJob } from '@/components/valet/types';

const POLL_MS = 6000;

type FilterKey = 'ALL' | 'DEPARTURES' | 'RETURNS' | 'NEEDS_ACTION';

export default function ValetQueuePage() {
  const { profile } = useValet();
  const [jobs, setJobs] = useState<ReservationJob[]>([]);
  const [pendingOffers, setPendingOffers] = useState<JobOfferSummary[]>([]);
  const [dayOffset, setDayOffset] = useState(0);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/valet/jobs');
      if (!res.ok) return;
      const data = await res.json();
      setJobs(data.jobs ?? []);
      setPendingOffers(data.pendingOffers ?? []);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const handleChange = useCallback((reservationId: string, patch: Partial<ReservationJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === reservationId ? { ...j, ...patch } : j)));
  }, []);

  const assignments: Assignment[] = useMemo(() => {
    const out: Assignment[] = [];
    for (const job of jobs) {
      if (job.departureValetId === profile.id && isSameDayAsOffset(job.departureDate, dayOffset)) {
        out.push({ type: 'DEPARTURE', reservation: job });
      }
      if (job.returnValetId === profile.id && isSameDayAsOffset(job.returnDateEstimate, dayOffset)) {
        out.push({ type: 'RETURN', reservation: job });
      }
    }
    return out;
  }, [jobs, dayOffset, profile.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter((a) => {
      if (filter === 'DEPARTURES' && a.type !== 'DEPARTURE') return false;
      if (filter === 'RETURNS' && a.type !== 'RETURN') return false;
      if (filter === 'NEEDS_ACTION' && !assignmentNeedsAction(a.type, a.reservation.activityLogs)) return false;
      if (!q) return true;
      const r = a.reservation;
      return (
        r.customer.fullName.toLowerCase().includes(q) ||
        (r.plate ?? '').toLowerCase().includes(q) ||
        r.bookingCode.toLowerCase().includes(q) ||
        (r.customer.phone ?? '').toLowerCase().includes(q)
      );
    });
  }, [assignments, filter, search]);

  const readOnly = dayOffset !== 0;
  const activeOffer = pendingOffers[0] ?? null;

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'DEPARTURES', label: 'Departures' },
    { key: 'RETURNS', label: 'Returns' },
    { key: 'NEEDS_ACTION', label: 'Needs Action' },
  ];

  return (
    <div className="space-y-4">
      <DateSelector selectedOffset={dayOffset} onSelect={setDayOffset} />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name, plate, booking, phone…"
        className="h-12 w-full rounded-card border border-light-gray bg-dark-gray px-4 text-sm text-white placeholder:text-medium-gray"
      />

      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap ${
              filter === f.key ? 'bg-white text-black' : 'border border-light-gray text-medium-gray'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loaded && filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-medium-gray">
            {assignments.length === 0 ? 'No jobs for this day.' : 'No jobs match your search/filter.'}
          </p>
        )}
        {filtered.map((a) => (
          <JobCard
            key={`${a.type}-${a.reservation.id}`}
            assignment={a}
            meId={profile.id}
            readOnly={readOnly}
            onChange={handleChange}
          />
        ))}
      </div>

      {activeOffer && <JobAlarmModal key={activeOffer.id} offer={activeOffer} onResolved={fetchJobs} />}
    </div>
  );
}
