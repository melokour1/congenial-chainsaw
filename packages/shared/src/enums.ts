// Mirrors packages/database/schema.prisma enums exactly — keep in sync.

export const UserRole = { CUSTOMER: 'CUSTOMER', VALET: 'VALET', ADMIN: 'ADMIN' } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ValetQueueStatus = { AVAILABLE: 'AVAILABLE', BUSY: 'BUSY', BREAK: 'BREAK', OFF: 'OFF' } as const;
export type ValetQueueStatus = (typeof ValetQueueStatus)[keyof typeof ValetQueueStatus];

export const Transmission = { AUTOMATIC: 'AUTOMATIC', MANUAL: 'MANUAL' } as const;
export type Transmission = (typeof Transmission)[keyof typeof Transmission];

export const RentalClass = {
  ECONOMY: 'ECONOMY', STANDARD: 'STANDARD', SUV: 'SUV', PREMIUM: 'PREMIUM', LUXURY: 'LUXURY', VAN: 'VAN',
} as const;
export type RentalClass = (typeof RentalClass)[keyof typeof RentalClass];

export const FleetStatus = { AVAILABLE: 'AVAILABLE', RENTED: 'RENTED', MAINTENANCE: 'MAINTENANCE' } as const;
export type FleetStatus = (typeof FleetStatus)[keyof typeof FleetStatus];

export const ServiceTier = { STANDARD: 'STANDARD', VIP_EXPRESS: 'VIP_EXPRESS', VIP_ELITE: 'VIP_ELITE' } as const;
export type ServiceTier = (typeof ServiceTier)[keyof typeof ServiceTier];

export const OriginType = { LAX: 'LAX', JSX: 'JSX', ATLANTIC_AVIATION: 'ATLANTIC_AVIATION' } as const;
export type OriginType = (typeof OriginType)[keyof typeof OriginType];

export const ReservationStatus = {
  CONFIRMED: 'CONFIRMED',
  LIVE: 'LIVE',
  CHECKED_IN: 'CHECKED_IN',
  IN_TRIP: 'IN_TRIP',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  DELIVERING: 'DELIVERING',
  DELIVERED_PENDING_CLOSE: 'DELIVERED_PENDING_CLOSE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  UPDATED: 'UPDATED',
} as const;
export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const CustomerEtaBand = {
  UNDER_15: 'UNDER_15', MIN_15_30: 'MIN_15_30', MIN_30_45: 'MIN_30_45', PLUS_45: 'PLUS_45',
} as const;
export type CustomerEtaBand = (typeof CustomerEtaBand)[keyof typeof CustomerEtaBand];

export const AddOnType = {
  HAND_WASH: 'HAND_WASH', FULL_DETAIL: 'FULL_DETAIL', EV_CHARGE: 'EV_CHARGE', GAS_FILL_UP: 'GAS_FILL_UP',
} as const;
export type AddOnType = (typeof AddOnType)[keyof typeof AddOnType];

export const AddOnStatus = { PENDING: 'PENDING', COMPLETE: 'COMPLETE' } as const;
export type AddOnStatus = (typeof AddOnStatus)[keyof typeof AddOnStatus];

export const PhotoStage = {
  PICKUP: 'PICKUP', RETURN: 'RETURN', ADDON: 'ADDON', RENTAL_PICKUP: 'RENTAL_PICKUP', RENTAL_RETURN: 'RENTAL_RETURN',
} as const;
export type PhotoStage = (typeof PhotoStage)[keyof typeof PhotoStage];

export const DeliveryMethod = { LOT: 'LOT', LAX: 'LAX', HOME: 'HOME' } as const;
export type DeliveryMethod = (typeof DeliveryMethod)[keyof typeof DeliveryMethod];

export const RentalStatus = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  PENDING_INSURANCE: 'PENDING_INSURANCE',
  READY: 'READY',
  PICKED_UP: 'PICKED_UP',
  RETURNED: 'RETURNED',
  OVERDUE: 'OVERDUE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;
export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus];

export const InsuranceOption = { OWN: 'OWN', LAXVALETCARE_PLAN: 'LAXVALETCARE_PLAN' } as const;
export type InsuranceOption = (typeof InsuranceOption)[keyof typeof InsuranceOption];

export const InsurancePlanTier = { BASIC: 'BASIC', STANDARD: 'STANDARD', PREMIUM: 'PREMIUM' } as const;
export type InsurancePlanTier = (typeof InsurancePlanTier)[keyof typeof InsurancePlanTier];

export const InsuranceStatus = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' } as const;
export type InsuranceStatus = (typeof InsuranceStatus)[keyof typeof InsuranceStatus];

export const OverdueStage = { NONE: 'NONE', T2H: 'T2H', T24H: 'T24H', T48H: 'T48H', T72H: 'T72H' } as const;
export type OverdueStage = (typeof OverdueStage)[keyof typeof OverdueStage];

export const FaceMatchStatus = {
  PENDING: 'PENDING', MATCHED: 'MATCHED', FAILED: 'FAILED', MANUAL_REVIEW: 'MANUAL_REVIEW',
} as const;
export type FaceMatchStatus = (typeof FaceMatchStatus)[keyof typeof FaceMatchStatus];

export const ChatStatus = { AI: 'AI', HUMAN_REQUESTED: 'HUMAN_REQUESTED', HUMAN_ACTIVE: 'HUMAN_ACTIVE', CLOSED: 'CLOSED' } as const;
export type ChatStatus = (typeof ChatStatus)[keyof typeof ChatStatus];

export const ChatSender = { AI: 'AI', CUSTOMER: 'CUSTOMER', ADMIN: 'ADMIN' } as const;
export type ChatSender = (typeof ChatSender)[keyof typeof ChatSender];

export const JobOfferType = { DEPARTURE: 'DEPARTURE', RETURN_STAGE1: 'RETURN_STAGE1', RETURN_STAGE2: 'RETURN_STAGE2' } as const;
export type JobOfferType = (typeof JobOfferType)[keyof typeof JobOfferType];

export const OfferResponse = { PENDING: 'PENDING', ACCEPTED: 'ACCEPTED', DECLINED: 'DECLINED', EXPIRED: 'EXPIRED' } as const;
export type OfferResponse = (typeof OfferResponse)[keyof typeof OfferResponse];
