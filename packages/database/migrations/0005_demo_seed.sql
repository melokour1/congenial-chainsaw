-- Demo data for investor/stakeholder walkthroughs — realistic-looking activity so the
-- admin dashboard and customer-facing pages aren't empty. Fictional people, real schema
-- shapes. Safe to delete freely (see docs/HANDOFF.md) once real customers exist —
-- these profile rows have no auth.users row behind them and can never sign in.

-- ── Valets ───────────────────────────────────────────────────────────────

insert into profiles (id, role, "fullName", email, phone, "valetStatus", "queuePosition", "clockedInAt") values
  ('11111111-1111-4111-8111-111111111101', 'VALET', 'Marcus Bell', 'marcus.bell@example.com', '+13105550111', 'AVAILABLE', 1, now() - interval '3 hours'),
  ('11111111-1111-4111-8111-111111111102', 'VALET', 'Priya Nair', 'priya.nair@example.com', '+13105550112', 'BUSY', 2, now() - interval '5 hours'),
  ('11111111-1111-4111-8111-111111111103', 'VALET', 'Diego Alvarez', 'diego.alvarez@example.com', '+13105550113', 'OFF', null, null);

-- ── Customers ────────────────────────────────────────────────────────────

insert into profiles (id, role, "fullName", email, phone) values
  ('22222222-2222-4222-8222-222222222201', 'CUSTOMER', 'Sarah Whitfield', 'sarah.whitfield@example.com', '+14155550201'),
  ('22222222-2222-4222-8222-222222222202', 'CUSTOMER', 'James Ochoa', 'james.ochoa@example.com', '+16195550202'),
  ('22222222-2222-4222-8222-222222222203', 'CUSTOMER', 'Linh Tran', 'linh.tran@example.com', '+12135550203'),
  ('22222222-2222-4222-8222-222222222204', 'CUSTOMER', 'Robert Kessler', 'robert.kessler@example.com', '+14085550204'),
  ('22222222-2222-4222-8222-222222222205', 'CUSTOMER', 'Amara Okafor', 'amara.okafor@example.com', '+19495550205');

-- ── Valet reservations (spread across today +/- a few days for realistic dashboard stats) ──

insert into reservations (
  id, "bookingCode", "customerId", "originType", "terminalId", "departingAirline", "departingFlightNumber",
  "departureDate", "returnDateEstimate", "vehicleColor", "vehicleMake", "vehicleModel", transmission,
  plate, "serviceTier", "gratuityCents", "priceBreakdown", "totalCents", status,
  "departureValetId", "returnValetId", "createdAt", "updatedAt"
) values
  ('33333333-3333-4333-8333-333333333301', 'MRBW-110826', '22222222-2222-4222-8222-222222222201', 'LAX', 'term_4', 'American Airlines', 'AA1422',
    now() + interval '2 hours', now() + interval '3 days', 'Silver', 'Tesla', 'Model 3', 'AUTOMATIC',
    '8ABC123', 'STANDARD', 1500, '{"lineItems":[{"label":"Standard valet — 3 days","cents":14085}],"subtotalCents":14085,"taxCents":1409,"serviceFeeCents":1761,"gratuityCents":1500,"totalCents":18755}', 18755, 'CONFIRMED',
    null, null, now() - interval '1 day', now() - interval '1 day'),

  ('33333333-3333-4333-8333-333333333302', 'JQPL-110826', '22222222-2222-4222-8222-222222222202', 'LAX', 'term_7', 'United Airlines', 'UA889',
    now() - interval '40 minutes', now() + interval '5 days', 'Black', 'BMW', 'X5', 'AUTOMATIC',
    '7XYZ890', 'VIP_EXPRESS', 5000, '{"lineItems":[{"label":"Standard valet — 5 days","cents":23475},{"label":"VIP Express (1 person)","cents":50000}],"subtotalCents":73475,"taxCents":7348,"serviceFeeCents":9184,"gratuityCents":5000,"totalCents":95007}', 95007, 'CHECKED_IN',
    '11111111-1111-4111-8111-111111111102', null, now() - interval '2 days', now() - interval '30 minutes'),

  ('33333333-3333-4333-8333-333333333303', 'DVLK-110826', '22222222-2222-4222-8222-222222222203', 'LAX', 'term_3', 'Delta', 'DL1005',
    now() + interval '1 day', now() + interval '4 days', 'White', 'Honda', 'Accord', 'AUTOMATIC',
    '6DEF456', 'STANDARD', 0, '{"lineItems":[{"label":"Standard valet — 4 days","cents":18780}],"subtotalCents":18780,"taxCents":1878,"serviceFeeCents":2348,"gratuityCents":0,"totalCents":23006}', 23006, 'CONFIRMED',
    null, null, now() - interval '3 hours', now() - interval '3 hours'),

  ('33333333-3333-4333-8333-333333333304', 'TWNR-090826', '22222222-2222-4222-8222-222222222204', 'LAX', 'term_1', 'Southwest', 'WN2210',
    now() - interval '2 days', now() - interval '2 hours', 'Blue', 'Toyota', 'Camry', 'AUTOMATIC',
    '5GHI789', 'STANDARD', 2000, '{"lineItems":[{"label":"Standard valet — 2 days","cents":9390}],"subtotalCents":9390,"taxCents":939,"serviceFeeCents":1174,"gratuityCents":2000,"totalCents":13503}', 13503, 'DELIVERING',
    '11111111-1111-4111-8111-111111111101', '11111111-1111-4111-8111-111111111101', now() - interval '2 days', now() - interval '10 minutes'),

  ('33333333-3333-4333-8333-333333333305', 'ECHF-080826', '22222222-2222-4222-8222-222222222205', 'LAX', 'term_b', 'Emirates', 'EK215',
    now() - interval '3 days', now() - interval '1 day', 'Gray', 'Mercedes-Benz', 'E-Class', 'AUTOMATIC',
    null, 'VIP_ELITE', 20000, '{"lineItems":[{"label":"Standard valet — 2 days","cents":9390},{"label":"VIP Elite (2 people)","cents":400000}],"subtotalCents":409390,"taxCents":40939,"serviceFeeCents":51174,"gratuityCents":20000,"totalCents":521503}', 521503, 'CLOSED',
    '11111111-1111-4111-8111-111111111102', '11111111-1111-4111-8111-111111111102', now() - interval '3 days', now());

-- ── Rating on the closed reservation ─────────────────────────────────────

insert into ratings (id, "reservationId", stars, comment, "tipCents") values
  ('44444444-4444-4444-8444-444444444401', '33333333-3333-4333-8333-333333333305', 5, 'Flawless — car was spotless and right on time.', 15000);

-- ── Rentals ──────────────────────────────────────────────────────────────

insert into rental_bookings (
  id, "bookingCode", "customerId", "fleetVehicleId", "pickupDate", "returnDate", "deliveryMethod",
  status, "insuranceOption", "insurancePlan", "insuranceStatus", "priceBreakdown", "totalCents", "depositHoldCents",
  "createdAt", "updatedAt"
) values
  ('55555555-5555-4555-8555-555555555501', 'RNSK-110826', '22222222-2222-4222-8222-222222222201', 'fleet_suv_1',
    now() + interval '1 day', now() + interval '4 days', 'LOT', 'PENDING_INSURANCE', 'LAXVALETCARE_PLAN', 'STANDARD', 'PENDING',
    '{"lineItems":[{"label":"SUV — 3 days","cents":25500},{"label":"STANDARD protection plan — 3 days","cents":7500}],"subtotalCents":33000,"taxCents":3300,"serviceFeeCents":4125,"gratuityCents":0,"totalCents":40425}', 40425, 50000,
    now() - interval '6 hours', now() - interval '6 hours'),

  ('55555555-5555-4555-8555-555555555502', 'RNLX-090826', '22222222-2222-4222-8222-222222222204', 'fleet_lux_1',
    now() - interval '1 day', now() + interval '2 days', 'LAX', 'READY', 'OWN', null, 'APPROVED',
    '{"lineItems":[{"label":"LUXURY — 3 days","cents":60000},{"label":"Delivery (LAX)","cents":5000}],"subtotalCents":65000,"taxCents":6500,"serviceFeeCents":8125,"gratuityCents":0,"totalCents":79625}', 79625, 100000,
    now() - interval '2 days', now() - interval '1 day');

-- ── Activity log (Admin dashboard "Recent activity") ────────────────────

insert into activity_logs (id, "reservationId", "actorId", action, detail, "createdAt") values
  ('66666666-6666-4666-8666-666666666601', '33333333-3333-4333-8333-333333333302', '11111111-1111-4111-8111-111111111102', 'Vehicle received', null, now() - interval '30 minutes'),
  ('66666666-6666-4666-8666-666666666602', '33333333-3333-4333-8333-333333333304', '11111111-1111-4111-8111-111111111101', 'Heading with vehicle', null, now() - interval '10 minutes'),
  ('66666666-6666-4666-8666-666666666603', '33333333-3333-4333-8333-333333333305', '11111111-1111-4111-8111-111111111102', 'Edited booking', '{"note":"Adjusted return time per customer request"}', now() - interval '1 day');

-- ── Notifications (Admin dashboard "Today's alerts") ─────────────────────

insert into notifications (id, "profileId", title, body, type, "rentalBookingId", "sentVia", "createdAt") values
  ('77777777-7777-4777-8777-777777777701', '22222222-2222-4222-8222-222222222201', 'Insurance re-upload needed', 'Insurance card photo was blurry — customer notified to re-upload before pickup.', 'RENTAL_INSURANCE_REJECTED', '55555555-5555-4555-8555-555555555501', '{IN_APP}', now() - interval '5 hours');
