import { describe, it, expect } from 'vitest';
import { calcValetPrice, calcRentalPrice, formatCents, type PricingConfig } from './pricing';

// Mirrors the values seeded in packages/database/migrations/0003_seed.sql so these
// tests catch drift between the pricing math and what's actually configured.
const PRICING: PricingConfig = {
  valet: { standardPerDayCents: 4695, vipExpressPerPersonCents: 50000, vipElitePerPersonCents: 200000 },
  carCare: { handWashCents: 6995, fullDetailCents: 49995, evChargeCents: 4595, gasFillUpCents: null },
  crossAirport: { burbankCents: 20000, johnWayneCents: 25000 },
  rental: {
    classDailyRateCents: { ECONOMY: 4500, STANDARD: 6500, SUV: 8500, PREMIUM: 12000, LUXURY: 20000, VAN: 15000 },
    deliveryCents: { LOT: 0, LAX: 5000, HOME: 3500 },
    weeklyDiscountPct: 17.5,
    monthlyDiscountPct: 35,
  },
  rentalInsurance: { basicPerDayCents: 1500, standardPerDayCents: 2500, premiumPerDayCents: 4000 },
  taxPct: 10,
  serviceFeePct: 12.5,
  securityDepositCents: { min: 50000, max: 100000 },
};

describe('calcValetPrice', () => {
  it('charges standard tier per day, plus tax and service fee', () => {
    const b = calcValetPrice(
      { departureDate: new Date('2026-08-09'), returnDateEstimate: new Date('2026-08-12'), serviceTier: 'STANDARD' },
      PRICING,
    );
    expect(b.subtotalCents).toBe(4695 * 3); // 3 days
    expect(b.taxCents).toBe(Math.round(b.subtotalCents * 0.1));
    expect(b.taxPct).toBe(10);
    expect(b.serviceFeeCents).toBe(Math.round(b.subtotalCents * 0.125));
    expect(b.serviceFeePct).toBe(12.5);
    expect(b.totalCents).toBe(b.subtotalCents + b.taxCents + b.serviceFeeCents);
    expect(b.lineItems[0].detail).toBe('$46.95/day × 3 days');
  });

  it('rounds up partial days (a booking under 24h still bills 1 day)', () => {
    const b = calcValetPrice(
      { departureDate: new Date('2026-08-09T08:00:00'), returnDateEstimate: new Date('2026-08-09T20:00:00'), serviceTier: 'STANDARD' },
      PRICING,
    );
    expect(b.subtotalCents).toBe(4695);
  });

  it('adds the VIP Express per-person fee on top of standard valet', () => {
    const b = calcValetPrice(
      { departureDate: new Date('2026-08-09'), returnDateEstimate: new Date('2026-08-10'), serviceTier: 'VIP_EXPRESS', vipPersonCount: 2 },
      PRICING,
    );
    expect(b.lineItems).toEqual([
      { label: 'Standard valet — 1 day', cents: 4695, detail: '$46.95/day × 1 day' },
      { label: 'VIP Express (2 persons)', cents: 100000, detail: '$500.00/person × 2 persons' },
    ]);
    expect(b.subtotalCents).toBe(4695 + 100000);
  });

  it('adds VIP Elite per-person fee', () => {
    const b = calcValetPrice(
      { departureDate: new Date('2026-08-09'), returnDateEstimate: new Date('2026-08-10'), serviceTier: 'VIP_ELITE', vipPersonCount: 1 },
      PRICING,
    );
    expect(b.subtotalCents).toBe(4695 + 200000);
  });

  it('adds car care add-ons as separate line items', () => {
    const b = calcValetPrice(
      {
        departureDate: new Date('2026-08-09'),
        returnDateEstimate: new Date('2026-08-10'),
        serviceTier: 'STANDARD',
        addOns: ['HAND_WASH', 'FULL_DETAIL'],
      },
      PRICING,
    );
    expect(b.subtotalCents).toBe(4695 + 6995 + 49995);
  });

  it('treats a null gas fill-up price as free rather than crashing', () => {
    const b = calcValetPrice(
      { departureDate: new Date('2026-08-09'), returnDateEstimate: new Date('2026-08-10'), serviceTier: 'STANDARD', addOns: ['GAS_FILL_UP'] },
      PRICING,
    );
    expect(b.lineItems.find((li) => li.label === 'Gas Fill-Up')?.cents).toBe(0);
  });

  it('adds gratuity on top of tax/fee, not into the taxed subtotal', () => {
    const b = calcValetPrice(
      { departureDate: new Date('2026-08-09'), returnDateEstimate: new Date('2026-08-10'), serviceTier: 'STANDARD', gratuityCents: 1000 },
      PRICING,
    );
    expect(b.gratuityCents).toBe(1000);
    expect(b.taxCents).toBe(Math.round(4695 * 0.1)); // gratuity excluded from taxable subtotal
    expect(b.totalCents).toBe(b.subtotalCents + b.taxCents + b.serviceFeeCents + 1000);
  });
});

describe('calcRentalPrice', () => {
  it('charges the daily rate with no discount under 7 days', () => {
    const b = calcRentalPrice(
      { pickupDate: new Date('2026-08-09'), returnDate: new Date('2026-08-12'), rentalClass: 'ECONOMY', deliveryMethod: 'LOT', insurance: { option: 'OWN' } },
      PRICING,
    );
    expect(b.lineItems[0].cents).toBe(4500 * 3);
  });

  it('applies the weekly discount at exactly 7 days', () => {
    const b = calcRentalPrice(
      { pickupDate: new Date('2026-08-01'), returnDate: new Date('2026-08-08'), rentalClass: 'ECONOMY', deliveryMethod: 'LOT', insurance: { option: 'OWN' } },
      PRICING,
    );
    const expected = Math.round(4500 * 7 * (1 - 17.5 / 100));
    expect(b.lineItems[0].cents).toBe(expected);
    expect(b.lineItems[0].label).toContain('Weekly discount');
    expect(b.lineItems[0].detail).toBe('$45.00/day × 7 days, less 17.5% weekly discount');
  });

  it('applies the monthly discount (not weekly) at exactly 30 days', () => {
    const b = calcRentalPrice(
      { pickupDate: new Date('2026-08-01'), returnDate: new Date('2026-08-31'), rentalClass: 'ECONOMY', deliveryMethod: 'LOT', insurance: { option: 'OWN' } },
      PRICING,
    );
    const expected = Math.round(4500 * 30 * (1 - 35 / 100));
    expect(b.lineItems[0].cents).toBe(expected);
    expect(b.lineItems[0].label).toContain('Monthly discount');
  });

  it('adds delivery cost as a line item only when non-zero', () => {
    const lot = calcRentalPrice(
      { pickupDate: new Date('2026-08-09'), returnDate: new Date('2026-08-10'), rentalClass: 'ECONOMY', deliveryMethod: 'LOT', insurance: { option: 'OWN' } },
      PRICING,
    );
    expect(lot.lineItems).toHaveLength(1); // no delivery line for free LOT pickup

    const home = calcRentalPrice(
      { pickupDate: new Date('2026-08-09'), returnDate: new Date('2026-08-10'), rentalClass: 'ECONOMY', deliveryMethod: 'HOME', insurance: { option: 'OWN' } },
      PRICING,
    );
    expect(home.lineItems.find((li) => li.label.includes('Delivery'))?.cents).toBe(3500);
  });

  it('adds the protection plan cost per day when opted in', () => {
    const b = calcRentalPrice(
      {
        pickupDate: new Date('2026-08-09'),
        returnDate: new Date('2026-08-12'),
        rentalClass: 'ECONOMY',
        deliveryMethod: 'LOT',
        insurance: { option: 'LAXVALETCARE_PLAN', plan: 'PREMIUM' },
      },
      PRICING,
    );
    expect(b.lineItems.find((li) => li.label.includes('PREMIUM'))?.cents).toBe(4000 * 3);
  });
});

describe('formatCents', () => {
  it('formats whole dollars', () => expect(formatCents(4500)).toBe('$45.00'));
  it('formats cents correctly, not truncated', () => expect(formatCents(4695)).toBe('$46.95'));
  it('formats zero', () => expect(formatCents(0)).toBe('$0.00'));
});
