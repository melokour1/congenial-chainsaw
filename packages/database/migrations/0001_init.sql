-- LAXValetCare — initial schema
-- Mirrors packages/database/schema.prisma exactly (table/column names match
-- Prisma's defaults) so `prisma db pull` / `prisma migrate resolve` will line up
-- once a direct DATABASE_URL is configured.

-- ── Enums ─────────────────────────────────────────────────────────────────

create type "UserRole" as enum ('CUSTOMER','VALET','ADMIN');
create type "ValetQueueStatus" as enum ('AVAILABLE','BUSY','BREAK','OFF');
create type "Transmission" as enum ('AUTOMATIC','MANUAL');
create type "RentalClass" as enum ('ECONOMY','STANDARD','SUV','PREMIUM','LUXURY','VAN');
create type "FleetStatus" as enum ('AVAILABLE','RENTED','MAINTENANCE');
create type "ServiceTier" as enum ('STANDARD','VIP_EXPRESS','VIP_ELITE');
create type "OriginType" as enum ('LAX','JSX','ATLANTIC_AVIATION');
create type "ReservationStatus" as enum ('CONFIRMED','LIVE','CHECKED_IN','IN_TRIP','RETURN_REQUESTED','DELIVERING','DELIVERED_PENDING_CLOSE','CLOSED','CANCELLED','UPDATED');
create type "CustomerEtaBand" as enum ('UNDER_15','MIN_15_30','MIN_30_45','PLUS_45');
create type "AddOnType" as enum ('HAND_WASH','FULL_DETAIL','EV_CHARGE','GAS_FILL_UP');
create type "AddOnStatus" as enum ('PENDING','COMPLETE');
create type "PhotoStage" as enum ('PICKUP','RETURN','ADDON','RENTAL_PICKUP','RENTAL_RETURN');
create type "DeliveryMethod" as enum ('LOT','LAX','HOME');
create type "RentalStatus" as enum ('PENDING_VERIFICATION','PENDING_INSURANCE','READY','PICKED_UP','RETURNED','OVERDUE','CLOSED','CANCELLED');
create type "InsuranceOption" as enum ('OWN','LAXVALETCARE_PLAN');
create type "InsurancePlanTier" as enum ('BASIC','STANDARD','PREMIUM');
create type "InsuranceStatus" as enum ('PENDING','APPROVED','REJECTED');
create type "OverdueStage" as enum ('NONE','T2H','T24H','T48H','T72H');
create type "FaceMatchStatus" as enum ('PENDING','MATCHED','FAILED','MANUAL_REVIEW');
create type "DiscountType" as enum ('PERCENT','FIXED_CENTS','FREE_SERVICE');
create type "ChatStatus" as enum ('AI','HUMAN_REQUESTED','HUMAN_ACTIVE','CLOSED');
create type "ChatSender" as enum ('AI','CUSTOMER','ADMIN');
create type "JobOfferType" as enum ('DEPARTURE','RETURN_STAGE1','RETURN_STAGE2');
create type "OfferResponse" as enum ('PENDING','ACCEPTED','DECLINED','EXPIRED');

-- ── Identity ──────────────────────────────────────────────────────────────

create table profiles (
  id text primary key, -- == auth.users.id::text
  role "UserRole" not null,
  "fullName" text not null,
  email text not null unique,
  phone text,
  "photoUrl" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "valetStatus" "ValetQueueStatus",
  "queuePosition" int,
  "clockedInAt" timestamptz,
  "sessionExpiresAt" timestamptz
);
create index on profiles (role);

-- ── Terminal directory ───────────────────────────────────────────────────

create table terminals (
  id text primary key,
  code text not null unique,
  name text not null,
  "isOffSite" boolean not null default false,
  "offSiteAddress" text,
  "isClosed" boolean not null default false,
  "closedNote" text,
  note text
);

create table airlines (
  id text primary key,
  name text not null,
  "terminalId" text not null references terminals(id)
);
create index on airlines ("terminalId");

-- ── Vehicles ─────────────────────────────────────────────────────────────

create table vehicles (
  id text primary key,
  "ownerId" text references profiles(id),
  color text not null,
  make text not null,
  model text not null,
  transmission "Transmission" not null,
  plate text,
  "createdAt" timestamptz not null default now()
);
create index on vehicles ("ownerId");

create table fleet_vehicles (
  id text primary key,
  class "RentalClass" not null,
  make text not null,
  model text not null,
  year int not null,
  color text not null,
  plate text not null unique,
  "dailyRateCents" int not null,
  photos text[] not null default '{}',
  status "FleetStatus" not null default 'AVAILABLE',
  mileage int not null default 0,
  location text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- ── Valet reservations ───────────────────────────────────────────────────

create table reservations (
  id text primary key,
  "bookingCode" text not null unique,
  "customerId" text not null references profiles(id),
  "originType" "OriginType" not null,
  "terminalId" text references terminals(id),
  "departingAirline" text,
  "departingFlightNumber" text,
  "returningAirline" text,
  "returningFlightNumber" text,
  "bagsInfo" text,
  "departureDate" timestamptz not null,
  "returnDateEstimate" timestamptz not null,
  "vehicleId" text references vehicles(id),
  "vehicleColor" text not null,
  "vehicleMake" text not null,
  "vehicleModel" text not null,
  transmission "Transmission" not null,
  plate text,
  "vehicleLocation" text,
  "serviceTier" "ServiceTier" not null,
  "gratuityCents" int not null default 0,
  "priceBreakdown" jsonb not null,
  "totalCents" int not null,
  "stripePaymentIntentId" text,
  status "ReservationStatus" not null default 'CONFIRMED',
  "departureValetId" text references profiles(id),
  "returnValetId" text references profiles(id),
  "customerEtaBand" "CustomerEtaBand",
  "customerEtaMinutes" int,
  "customerOnWayAt" timestamptz,
  "flightLandedAt" timestamptz,
  "customerAtCurbAt" timestamptz,
  "curbLocationDetail" text,
  notes text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index on reservations ("customerId");
create index on reservations (status);

create table reservation_add_ons (
  id text primary key,
  "reservationId" text not null references reservations(id),
  type "AddOnType" not null,
  "priceCents" int not null,
  status "AddOnStatus" not null default 'PENDING',
  "completedAt" timestamptz
);
create index on reservation_add_ons ("reservationId");

-- ── Rentals ──────────────────────────────────────────────────────────────

create table rental_bookings (
  id text primary key,
  "bookingCode" text not null unique,
  "customerId" text not null references profiles(id),
  "fleetVehicleId" text not null references fleet_vehicles(id),
  "pickupDate" timestamptz not null,
  "returnDate" timestamptz not null,
  "deliveryMethod" "DeliveryMethod" not null,
  "deliveryAddress" text,
  status "RentalStatus" not null default 'PENDING_VERIFICATION',
  "insuranceOption" "InsuranceOption" not null,
  "insurancePlan" "InsurancePlanTier",
  "insuranceStatus" "InsuranceStatus" not null default 'PENDING',
  "insuranceRejectionReason" text,
  "insuranceCardFrontUrl" text,
  "insuranceCardBackUrl" text,
  "insuranceCompany" text,
  "insurancePolicyNumber" text,
  "agreementPdfUrl" text,
  "agreementSignedAt" timestamptz,
  "agreementSignatureUrl" text,
  "addOns" jsonb,
  "priceBreakdown" jsonb not null,
  "totalCents" int not null,
  "depositHoldCents" int not null,
  "stripePaymentIntentId" text,
  "overdueStage" "OverdueStage" not null default 'NONE',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index on rental_bookings ("customerId");
create index on rental_bookings (status);

create table rental_verifications (
  id text primary key,
  "customerId" text not null unique references profiles(id),
  "dlNumber" text not null,
  "dlState" text not null,
  "dlExpiry" timestamptz not null,
  "dlFrontUrl" text not null,
  "dlBackUrl" text not null,
  dob timestamptz not null,
  "fullLegalName" text not null,
  "addressStreet" text not null,
  "addressUnit" text,
  "addressCity" text not null,
  "addressState" text not null,
  "addressZip" text not null,
  phone text not null,
  email text not null,
  "emergencyContactName" text not null,
  "emergencyContactPhone" text not null,
  "emergencyContactRelationship" text not null,
  "faceMatchStatus" "FaceMatchStatus" not null default 'PENDING',
  "faceMatchAttempts" int not null default 0,
  "verifiedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- ── Photos, activity, ratings ────────────────────────────────────────────

create table photos (
  id text primary key,
  "reservationId" text references reservations(id),
  "rentalBookingId" text references rental_bookings(id),
  url text not null,
  stage "PhotoStage" not null,
  "takenByValetId" text references profiles(id),
  "createdAt" timestamptz not null default now()
);
create index on photos ("reservationId");
create index on photos ("rentalBookingId");

create table activity_logs (
  id text primary key,
  "reservationId" text references reservations(id),
  "rentalBookingId" text references rental_bookings(id),
  "actorId" text references profiles(id),
  action text not null,
  detail jsonb,
  "createdAt" timestamptz not null default now()
);
create index on activity_logs ("reservationId");
create index on activity_logs ("rentalBookingId");

create table ratings (
  id text primary key,
  "reservationId" text not null unique references reservations(id),
  stars int not null,
  comment text,
  "tipCents" int not null default 0,
  "createdAt" timestamptz not null default now()
);

-- ── Promo codes, notifications, chat ─────────────────────────────────────

create table promo_codes (
  id text primary key,
  code text not null unique,
  description text not null,
  "discountType" "DiscountType" not null,
  "discountValue" int not null,
  active boolean not null default true,
  "expiresAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create table notifications (
  id text primary key,
  "profileId" text not null references profiles(id),
  title text not null,
  body text not null,
  type text not null,
  "reservationId" text references reservations(id),
  "rentalBookingId" text references rental_bookings(id),
  "sentVia" text[] not null default '{}',
  "readAt" timestamptz,
  "createdAt" timestamptz not null default now()
);
create index on notifications ("profileId");

create table chat_threads (
  id text primary key,
  "customerId" text not null references profiles(id),
  status "ChatStatus" not null default 'AI',
  "lastMessageAt" timestamptz not null default now()
);
create index on chat_threads ("customerId");

create table chat_messages (
  id text primary key,
  "threadId" text not null references chat_threads(id),
  sender "ChatSender" not null,
  "adminId" text references profiles(id),
  body text not null,
  "createdAt" timestamptz not null default now()
);
create index on chat_messages ("threadId");

-- ── Fair queue job dispatch ──────────────────────────────────────────────

create table job_offers (
  id text primary key,
  "reservationId" text references reservations(id),
  "rentalBookingId" text,
  "valetId" text not null references profiles(id),
  "jobType" "JobOfferType" not null,
  "offeredAt" timestamptz not null default now(),
  "respondedAt" timestamptz,
  response "OfferResponse" not null default 'PENDING',
  "roundNumber" int not null default 1
);
create index on job_offers ("reservationId");
create index on job_offers ("valetId");

-- ── App settings ─────────────────────────────────────────────────────────

create table app_settings (
  key text primary key,
  value jsonb not null,
  "updatedAt" timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────
-- Baseline: service_role (server) bypasses RLS automatically. These policies
-- cover direct anon/authenticated access from the browser via supabase-js.

alter table profiles enable row level security;
alter table reservations enable row level security;
alter table reservation_add_ons enable row level security;
alter table rental_bookings enable row level security;
alter table rental_verifications enable row level security;
alter table photos enable row level security;
alter table activity_logs enable row level security;
alter table ratings enable row level security;
alter table notifications enable row level security;
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;
alter table job_offers enable row level security;
alter table vehicles enable row level security;

-- Everyone can read their own profile; admins/valets are provisioned server-side.
create policy "profiles_select_own" on profiles for select using (auth.uid()::text = id);
create policy "profiles_update_own" on profiles for update using (auth.uid()::text = id);

-- Customers see only their own reservations / rentals / vehicles / verification.
create policy "reservations_select_own" on reservations for select using (auth.uid()::text = "customerId");
create policy "rental_bookings_select_own" on rental_bookings for select using (auth.uid()::text = "customerId");
create policy "rental_verifications_select_own" on rental_verifications for select using (auth.uid()::text = "customerId");
create policy "vehicles_select_own" on vehicles for select using (auth.uid()::text = "ownerId");
create policy "notifications_select_own" on notifications for select using (auth.uid()::text = "profileId");
create policy "ratings_select_own" on ratings for select using (
  exists (select 1 from reservations r where r.id = ratings."reservationId" and r."customerId" = auth.uid()::text)
);
create policy "chat_threads_select_own" on chat_threads for select using (auth.uid()::text = "customerId");
create policy "chat_messages_select_own" on chat_messages for select using (
  exists (select 1 from chat_threads t where t.id = chat_messages."threadId" and t."customerId" = auth.uid()::text)
);

-- Terminals/airlines/fleet/promo codes are public read reference data.
alter table terminals enable row level security;
alter table airlines enable row level security;
alter table fleet_vehicles enable row level security;
alter table promo_codes enable row level security;
create policy "terminals_public_read" on terminals for select using (true);
create policy "airlines_public_read" on airlines for select using (true);
create policy "fleet_vehicles_public_read" on fleet_vehicles for select using (true);
create policy "promo_codes_public_read" on promo_codes for select using (active = true);

-- Note: admin/valet dashboards run through server-side API routes using the
-- Supabase service_role key (server-only secret, bypasses RLS), so admins and
-- valets don't need broad client-side RLS grants — see apps/web/src/lib/supabase-admin.ts.
