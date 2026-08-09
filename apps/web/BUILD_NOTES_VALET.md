# Valet Web App — Build Notes

Built entirely inside `apps/web/src/app/valet/**`, `apps/web/src/components/valet/**`, and
`apps/web/src/app/api/valet/**`. No files outside those trees were touched.

## What was built

### New API routes (`app/api/valet/**`)
- `GET  /api/valet/me` — caller's own profile row (polled every 7s to keep queue position/status/session fresh).
- `POST /api/valet/status` — `{status: 'AVAILABLE'|'BUSY'|'BREAK'}`, backs the [Take Break] toggle.
- `PATCH /api/valet/photo` — `{dataUrl}`, uploads + sets `profiles.photoUrl`.
- `GET  /api/valet/jobs` — auth-checks VALET/ADMIN then uses `createAdminClient()` (RLS on
  reservations only allows customers to read their own rows) to return `{ jobs, pendingOffers }`
  for a today→+7-day window. `jobs` includes full joins (customer, terminal, addOns, photos,
  activityLogs) so cards never need a second round trip.
- `POST /api/valet/addons/[addOnId]/complete` — marks a `reservation_add_ons` row COMPLETE,
  logs activity, sends the customer notification "Your {addon} is complete ✨". Photos for the
  add-on are uploaded beforehand via the existing `/api/photos` (stage `ADDON`).
- `GET  /api/valet/stats` — all-time jobs completed / rating avg / tips total, plus a today slice,
  computed from `reservations` (status `CLOSED`) joined to `ratings`.

All new routes follow the existing pattern exactly: `createClient()` session → role check via
`profiles` → `createAdminClient()` for the actual read/write.

### Pages
- `app/valet/layout.tsx` (Server Component) — `requireRole('VALET', '/login')`, then hands the
  profile to `<ValetShell>`.
- `app/valet/page.tsx` — main queue: date selector (Today + next 7, future days read-only),
  search, All/Departures/Returns/Needs Action filter, polls `/api/valet/jobs` every 6s, renders
  `JobCard`s, and surfaces the full-screen `JobAlarmModal` for any pending job offer.
- `app/valet/profile/page.tsx` — photo upload (flags if missing), stats, today's summary,
  change password (`supabase.auth.updateUser`), Clock Out.

### Components (`components/valet/**`)
- `ValetContext.tsx` / `ValetShell.tsx` — client-side profile context + polling; `ValetShell`
  is the enforcement point for "clocked-out valets get zero data access" — it renders **only**
  `ClockInScreen` (no top bar, no `{children}` mounted at all) whenever `valetStatus==='OFF'`
  or `clockedInAt` is null, so the job-list/detail components never even mount, never fetch.
- `ClockInScreen.tsx`, `TopBar.tsx` — clock-in gate and the persistent top bar (name, status
  pill, queue position, Take Break/Back to Available, Clock Out).
- `JobAlarmModal.tsx` — 60s countdown alarm for new offers; auto-calls `respond` with
  `'EXPIRED'` at zero; ⚠️ MANUAL TRANSMISSION flag when applicable. Keyed by offer id in the
  parent so a second offer arriving right after the first resolves gets a fresh countdown.
- `JobCard.tsx` — the reservation card: on-the-way banner, off-site (JSX/Atlantic) badge,
  contact links, editable vehicle info, flight/booking/gratuity, add-on checklist, and the
  next-valid-action button sequence (done/next/disabled states driven off `activityLogs`).
  Falls back to a read-only "🟢 HANDLED BY {name}" card if a job is ever assigned to someone else.
- `VehicleInfoEditor.tsx` — inline tap-to-edit for all vehicle fields, PATCHes on blur.
- `AddOnChecklist.tsx` — collapsible "▼ Service updates", confirm → photo capture → complete flow.
- `PhotoCaptureSheet.tsx` — `<input type="file" capture="environment">` based multi-shot capture
  with a live count against the required minimum (4 for PICKUP/RETURN, 1 for ADDON).
- `ConfirmDialog.tsx` — the mandatory "This will send: '...'" confirmation used by every
  customer-facing action (spec 4.6).
- `actionCopy.ts` — single source of truth for action sequences + confirm-dialog copy, kept in
  exact sync with the `TRANSITIONS` map in `app/api/reservations/[id]/actions/route.ts` so the
  preview text always matches what's actually sent.
- `DateSelector.tsx`, `types.ts` — date chips + shared TS types for the whole surface.

## Design decisions worth flagging
- "My jobs" fetch is a single `GET /api/valet/jobs` covering an 8-day window (today + next 7);
  the date selector filters client-side rather than re-fetching per day, since polling every
  6s already keeps everything fresh.
- Return Stage 1 "🟠 FLIGHT LANDED" is currently a manual [Mark flight landed] button (PATCHes
  `flightLandedAt`) since live FlightAware auto-detection isn't wired yet — matches the
  allowance in the build brief.
- "🔴 AT THE CURB" is read-only display of `customerAtCurbAt`/`curbLocationDetail`, which the
  customer app sets via the existing `/api/reservations/[id]/at-curb` route — nothing new
  needed here since this alarm view is naturally exclusive to the assigned valet already (this
  app only ever shows the caller's own jobs).
- Photo requirements are enforced client-side by counting existing `PICKUP`/`RETURN` photos on
  the reservation before allowing `VEHICLE_RECEIVED` / `HEADING_WITH_VEHICLE` to proceed to the
  confirm dialog.

## Known TODOs / follow-ups
- No server-side sweep for expired job offers — relies on the valet's client calling
  `respond(..., 'EXPIRED')` when its countdown hits zero (same caveat already documented in
  `lib/queue.ts` for a production deploy).
- `GET /api/valet/jobs` does two separate reservation queries (as-departure, as-return) rather
  than one `.or()` query, to keep the two full-join selects simple; fine at current scale but
  could be collapsed later if needed.
- Environment has no installed `node_modules`, so this was reviewed by hand rather than via
  `next build`/`tsc --noEmit` — recommend running a full type-check/build once dependencies are
  installed.
- "Needs Action" filter and the done/next/disabled action-button states are both derived from
  `activityLogs` entries matching the literal action name — if an admin ever manually edits
  `reservation.status` without going through the valet action routes, the activity-log-derived
  sequence could drift from `status`. Not currently an issue since only these routes write those
  specific statuses.
