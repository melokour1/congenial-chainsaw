-- LAXValetCare — reference data seed (terminals, airlines, fleet, promos, pricing)

-- ── Terminals ────────────────────────────────────────────────────────────

insert into terminals (id, code, name, "isOffSite", "offSiteAddress", "isClosed", "closedNote", note) values
  ('term_1', '1', 'Terminal 1', false, null, false, null, 'Non-Southwest/JetBlue carriers may bus to West Gates'),
  ('term_2', '2', 'Terminal 2', false, null, false, null, null),
  ('term_3', '3', 'Terminal 3', false, null, false, null, 'Delta Hub — Delta One check-in at lower arrivals level, pillars 3F/3G'),
  ('term_4', '4', 'Terminal 4', false, null, false, null, null),
  ('term_5', '5', 'Terminal 5', false, null, true, 'Closed until 2028', null),
  ('term_6', '6', 'Terminal 6', false, null, false, null, null),
  ('term_7', '7', 'Terminal 7', false, null, false, null, null),
  ('term_8', '8', 'Terminal 8', false, null, false, null, null),
  ('term_b', 'B', 'Terminal B (TBIT)', false, null, false, null, '40+ international carriers');

-- ── Airlines ─────────────────────────────────────────────────────────────

insert into airlines (id, name, "terminalId") values
  ('al_1_1', 'Southwest', 'term_1'), ('al_1_2', 'JetBlue', 'term_1'), ('al_1_3', 'Allegiant', 'term_1'),
  ('al_1_4', 'Breeze', 'term_1'), ('al_1_5', 'Cayman Airways', 'term_1'), ('al_1_6', 'Frontier', 'term_1'),
  ('al_1_7', 'Sun Country', 'term_1'), ('al_1_8', 'Viva Aerobus', 'term_1'),

  ('al_2_1', 'Spirit', 'term_2'), ('al_2_2', 'LATAM', 'term_2'), ('al_2_3', 'WestJet', 'term_2'),
  ('al_2_4', 'Norse Atlantic', 'term_2'), ('al_2_5', 'Virgin Atlantic', 'term_2'),

  ('al_3_1', 'Delta', 'term_3'), ('al_3_2', 'Aeromexico', 'term_3'),

  ('al_4_1', 'American Airlines', 'term_4'), ('al_4_2', 'British Airways', 'term_4'), ('al_4_3', 'Japan Airlines', 'term_4'),

  ('al_6_1', 'Alaska', 'term_6'), ('al_6_2', 'Air Canada', 'term_6'), ('al_6_3', 'Hawaiian', 'term_6'),
  ('al_6_4', 'Horizon Air', 'term_6'), ('al_6_5', 'Porter', 'term_6'), ('al_6_6', 'Southern Airways Express', 'term_6'),

  ('al_7_1', 'United Airlines', 'term_7'), ('al_7_2', 'United Express', 'term_7'),
  ('al_8_1', 'United Airlines', 'term_8'), ('al_8_2', 'United Express', 'term_8'),

  ('al_b_1', 'Air France', 'term_b'), ('al_b_2', 'Emirates', 'term_b'), ('al_b_3', 'Lufthansa', 'term_b'),
  ('al_b_4', 'Qantas', 'term_b'), ('al_b_5', 'Singapore Airlines', 'term_b'), ('al_b_6', 'Cathay Pacific', 'term_b'),
  ('al_b_7', 'ANA', 'term_b'), ('al_b_8', 'Korean Air', 'term_b'), ('al_b_9', 'Qatar Airways', 'term_b'),
  ('al_b_10', 'Turkish Airlines', 'term_b');

-- ── Fleet (rentals) ──────────────────────────────────────────────────────

insert into fleet_vehicles (id, class, make, model, year, color, plate, "dailyRateCents", photos, status, mileage, location) values
  ('fleet_econ_1', 'ECONOMY', 'Toyota', 'Corolla', 2024, 'Silver', '8ECO101', 4500, '{}', 'AVAILABLE', 12000, 'LAXValetCare Lot A'),
  ('fleet_std_1', 'STANDARD', 'Honda', 'Accord', 2024, 'Black', '8STD101', 6500, '{}', 'AVAILABLE', 9800, 'LAXValetCare Lot A'),
  ('fleet_suv_1', 'SUV', 'Toyota', 'RAV4', 2024, 'White', '8SUV101', 8500, '{}', 'AVAILABLE', 15000, 'LAXValetCare Lot A'),
  ('fleet_prem_1', 'PREMIUM', 'BMW', '3 Series', 2024, 'Blue', '8PRM101', 12000, '{}', 'AVAILABLE', 6200, 'LAXValetCare Lot A'),
  ('fleet_lux_1', 'LUXURY', 'Mercedes-Benz', 'S-Class', 2024, 'Black', '8LUX101', 20000, '{}', 'AVAILABLE', 4100, 'LAXValetCare Lot A'),
  ('fleet_van_1', 'VAN', 'Chrysler', 'Pacifica', 2024, 'Gray', '8VAN101', 15000, '{}', 'AVAILABLE', 11000, 'LAXValetCare Lot A');

-- ── Promo codes ──────────────────────────────────────────────────────────

insert into promo_codes (id, code, description, "discountType", "discountValue", active, "expiresAt") values
  ('promo_first', 'FIRSTVALET', 'First valet booking free', 'FREE_SERVICE', 0, true, null),
  ('promo_welcome10', 'WELCOME10', '10% off your first booking', 'PERCENT', 10, true, null),
  ('promo_referral', 'REFER20', '$20 off for referrals', 'FIXED_CENTS', 2000, true, null);

-- ── App settings (pricing, tax, fees) ────────────────────────────────────

insert into app_settings (key, value) values
  ('pricing', '{
    "valet": { "standardPerDayCents": 4695, "vipExpressPerPersonCents": 50000, "vipElitePerPersonCents": 200000 },
    "carCare": { "handWashCents": 6995, "fullDetailCents": 49995, "evChargeCents": 4595, "gasFillUpCents": null },
    "crossAirport": { "burbankCents": 20000, "johnWayneCents": 25000 },
    "rental": {
      "classDailyRateCents": { "ECONOMY": 4500, "STANDARD": 6500, "SUV": 8500, "PREMIUM": 12000, "LUXURY": 20000, "VAN": 15000 },
      "deliveryCents": { "LOT": 0, "LAX": 5000, "HOME": 3500 },
      "weeklyDiscountPct": 17.5,
      "monthlyDiscountPct": 35
    },
    "rentalInsurance": { "basicPerDayCents": 1500, "standardPerDayCents": 2500, "premiumPerDayCents": 4000 },
    "taxPct": 10,
    "serviceFeePct": 12.5,
    "securityDepositCents": { "min": 50000, "max": 100000 }
  }'::jsonb),
  ('overdue_escalation', '{ "t2hHours": 2, "t24hHours": 24, "t48hHours": 48, "t72hHours": 72 }'::jsonb),
  ('chat', '{ "autoResponseMinutes": 6, "avgResponseMinutes": 5 }'::jsonb);
