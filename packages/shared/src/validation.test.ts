import { describe, it, expect } from 'vitest';
import { createValetReservationSchema, rentalBookingStepSchema, chatMessageSchema } from './validation';

describe('createValetReservationSchema', () => {
  const base = {
    originType: 'LAX' as const,
    departureDate: new Date('2026-08-09').toISOString(),
    returnDateEstimate: new Date('2026-08-12').toISOString(),
    departingAirline: 'Delta',
    departingFlightNumber: 'DL123',
    color: 'Black',
    make: 'Honda',
    model: 'Accord',
    transmission: 'AUTOMATIC' as const,
    serviceTier: 'STANDARD' as const,
    addOns: [],
    gratuityCents: 0,
  };

  it('accepts a minimal valid booking', () => {
    expect(createValetReservationSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an invalid originType', () => {
    const result = createValetReservationSchema.safeParse({ ...base, originType: 'SOMEWHERE_ELSE' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing required vehicle field', () => {
    const { make, ...rest } = base;
    const result = createValetReservationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects an unknown add-on type', () => {
    const result = createValetReservationSchema.safeParse({ ...base, addOns: ['OIL_CHANGE'] });
    expect(result.success).toBe(false);
  });
});

describe('rentalBookingStepSchema', () => {
  it('accepts a valid rental booking request', () => {
    const result = rentalBookingStepSchema.safeParse({
      fleetVehicleId: 'fleet_econ_1',
      pickupDate: new Date('2026-08-09').toISOString(),
      returnDate: new Date('2026-08-12').toISOString(),
      deliveryMethod: 'LOT',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-ISO date string', () => {
    const result = rentalBookingStepSchema.safeParse({
      fleetVehicleId: 'fleet_econ_1',
      pickupDate: '08/09/2026',
      returnDate: new Date('2026-08-12').toISOString(),
      deliveryMethod: 'LOT',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid delivery method', () => {
    const result = rentalBookingStepSchema.safeParse({
      fleetVehicleId: 'fleet_econ_1',
      pickupDate: new Date().toISOString(),
      returnDate: new Date().toISOString(),
      deliveryMethod: 'DRONE',
    });
    expect(result.success).toBe(false);
  });
});

describe('chatMessageSchema', () => {
  it('accepts a plain message with no threadId (new thread)', () => {
    expect(chatMessageSchema.safeParse({ body: 'How much for a week rental?' }).success).toBe(true);
  });

  it('rejects an empty message body', () => {
    expect(chatMessageSchema.safeParse({ body: '' }).success).toBe(false);
  });

  it('rejects a message over 2000 characters', () => {
    expect(chatMessageSchema.safeParse({ body: 'a'.repeat(2001) }).success).toBe(false);
  });
});
