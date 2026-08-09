// Zod schemas shared by client forms (instant validation) and API routes
// (authoritative validation) so the two never disagree.

import { z } from 'zod';

export const originStepSchema = z.object({
  originType: z.enum(['LAX', 'JSX', 'ATLANTIC_AVIATION']),
});

export const terminalStepSchema = z.object({
  terminalCode: z.string().min(1),
  airline: z.string().min(1),
  departureDate: z.string().datetime(),
  returnDateEstimate: z.string().datetime(),
  departingAirline: z.string().min(1),
  departingFlightNumber: z.string().min(1),
  returningAirline: z.string().optional(),
  returningFlightNumber: z.string().optional(),
  bagsInfo: z.string().optional(),
});

export const vehicleStepSchema = z.object({
  color: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  transmission: z.enum(['AUTOMATIC', 'MANUAL']),
  plate: z.string().optional(),
});

export const serviceTierStepSchema = z.object({
  serviceTier: z.enum(['STANDARD', 'VIP_EXPRESS', 'VIP_ELITE']),
  vipPersonCount: z.number().int().min(1).optional(),
});

export const addOnsStepSchema = z.object({
  addOns: z.array(z.enum(['HAND_WASH', 'FULL_DETAIL', 'EV_CHARGE', 'GAS_FILL_UP'])).default([]),
});

export const gratuityStepSchema = z.object({
  gratuityCents: z.number().int().min(0).default(0),
});

export const createValetReservationSchema = originStepSchema
  .merge(terminalStepSchema.partial({ terminalCode: true, airline: true }))
  .merge(vehicleStepSchema)
  .merge(serviceTierStepSchema)
  .merge(addOnsStepSchema)
  .merge(gratuityStepSchema)
  .extend({
    promoCode: z.string().optional(),
  });

export type CreateValetReservationInput = z.infer<typeof createValetReservationSchema>;

export const rentalBookingStepSchema = z.object({
  fleetVehicleId: z.string().min(1),
  pickupDate: z.string().datetime(),
  returnDate: z.string().datetime(),
  deliveryMethod: z.enum(['LOT', 'LAX', 'HOME']),
  deliveryAddress: z.string().optional(),
});

export const rentalVerificationSchema = z.object({
  dlNumber: z.string().min(1),
  dlState: z.string().length(2),
  dlExpiry: z.string().datetime(),
  dob: z.string().datetime(),
  fullLegalName: z.string().min(1),
  addressStreet: z.string().min(1),
  addressUnit: z.string().optional(),
  addressCity: z.string().min(1),
  addressState: z.string().length(2),
  addressZip: z.string().min(5),
  phone: z.string().min(10),
  email: z.string().email(),
  emergencyContactName: z.string().min(1),
  emergencyContactPhone: z.string().min(10),
  emergencyContactRelationship: z.string().min(1),
});

export const rentalInsuranceSchema = z.discriminatedUnion('option', [
  z.object({
    option: z.literal('OWN'),
    insuranceCompany: z.string().min(1),
    insurancePolicyNumber: z.string().min(1),
  }),
  z.object({
    option: z.literal('LAXVALETCARE_PLAN'),
    plan: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  }),
]);

export const customerOnWaySchema = z.object({
  etaBand: z.enum(['UNDER_15', 'MIN_15_30', 'MIN_30_45', 'PLUS_45']),
  etaMinutes: z.number().int().min(0).optional(),
});

export const customerAtCurbSchema = z.object({
  terminalCode: z.string().min(1),
  curbLocationDetail: z.string().min(1),
});

export const chatMessageSchema = z.object({
  threadId: z.string().optional(),
  body: z.string().min(1).max(2000),
});
