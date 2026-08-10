import { describe, it, expect } from 'vitest';
import { generateBookingCode } from './booking-code';

describe('generateBookingCode', () => {
  it('matches the documented format: 4 letters, dash, DDMMYY', () => {
    // Constructed in local time (not parsed from a UTC ISO string) so this doesn't
    // flake depending on the machine's timezone.
    const code = generateBookingCode(new Date(2026, 7, 9));
    expect(code).toMatch(/^[A-Z]{4}-\d{6}$/);
    expect(code.endsWith('-090826')).toBe(true);
  });

  it('never uses visually-ambiguous letters I or O', () => {
    // Run enough times that a bug reintroducing I/O would show up reliably.
    for (let i = 0; i < 200; i++) {
      const letters = generateBookingCode().slice(0, 4);
      expect(letters).not.toMatch(/[IO]/);
    }
  });

  it('pads single-digit day/month with a leading zero', () => {
    const code = generateBookingCode(new Date(2026, 0, 5));
    expect(code.endsWith('-050126')).toBe(true);
  });
});
