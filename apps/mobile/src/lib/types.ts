// Client-side types mirroring packages/database/migrations/0001_init.sql.
// Kept intentionally loose (most fields optional/nullable) since these rows
// come straight back from supabase-js / the REST API as JSON.

export interface Profile {
  id: string;
  role: 'CUSTOMER' | 'VALET' | 'ADMIN';
  fullName: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Terminal {
  id: string;
  code: string;
  name: string;
  isOffSite: boolean;
  offSiteAddress: string | null;
  isClosed: boolean;
  closedNote: string | null;
  note: string | null;
}

export interface ReservationAddOn {
  id: string;
  reservationId: string;
  type: 'HAND_WASH' | 'FULL_DETAIL' | 'EV_CHARGE' | 'GAS_FILL_UP';
  priceCents: number;
  status: 'PENDING' | 'COMPLETE';
  completedAt: string | null;
}

export interface Photo {
  id: string;
  reservationId: string | null;
  rentalBookingId: string | null;
  url: string;
  stage: 'PICKUP' | 'RETURN' | 'ADDON' | 'RENTAL_PICKUP' | 'RENTAL_RETURN';
  takenByValetId: string | null;
  createdAt: string;
}

export interface Rating {
  id: string;
  reservationId: string;
  stars: number;
  comment: string | null;
  tipCents: number;
  createdAt: string;
}

export type ReservationStatus =
  | 'CONFIRMED'
  | 'LIVE'
  | 'CHECKED_IN'
  | 'IN_TRIP'
  | 'RETURN_REQUESTED'
  | 'DELIVERING'
  | 'DELIVERED_PENDING_CLOSE'
  | 'CLOSED'
  | 'CANCELLED'
  | 'UPDATED';

export interface Reservation {
  id: string;
  bookingCode: string;
  customerId: string;
  originType: 'LAX' | 'JSX' | 'ATLANTIC_AVIATION';
  terminalId: string | null;
  terminal?: Terminal | null;
  departingAirline: string | null;
  departingFlightNumber: string | null;
  returningAirline: string | null;
  returningFlightNumber: string | null;
  bagsInfo: string | null;
  departureDate: string;
  returnDateEstimate: string;
  vehicleColor: string;
  vehicleMake: string;
  vehicleModel: string;
  transmission: 'AUTOMATIC' | 'MANUAL';
  plate: string | null;
  vehicleLocation: string | null;
  serviceTier: 'STANDARD' | 'VIP_EXPRESS' | 'VIP_ELITE';
  gratuityCents: number;
  priceBreakdown: {
    lineItems: { label: string; cents: number }[];
    subtotalCents: number;
    taxCents: number;
    serviceFeeCents: number;
    gratuityCents: number;
    totalCents: number;
  };
  totalCents: number;
  status: ReservationStatus;
  departureValetId: string | null;
  returnValetId: string | null;
  customerEtaBand: 'UNDER_15' | 'MIN_15_30' | 'MIN_30_45' | 'PLUS_45' | null;
  customerEtaMinutes: number | null;
  customerOnWayAt: string | null;
  flightLandedAt: string | null;
  customerAtCurbAt: string | null;
  curbLocationDetail: string | null;
  notes: string | null;
  addOns?: ReservationAddOn[];
  photos?: Photo[];
  rating?: Rating | Rating[] | null;
  createdAt: string;
  updatedAt: string;
}

export type RentalStatus =
  | 'PENDING_VERIFICATION'
  | 'PENDING_INSURANCE'
  | 'READY'
  | 'PICKED_UP'
  | 'RETURNED'
  | 'OVERDUE'
  | 'CLOSED'
  | 'CANCELLED';

export interface FleetVehicle {
  id: string;
  class: 'ECONOMY' | 'STANDARD' | 'SUV' | 'PREMIUM' | 'LUXURY' | 'VAN';
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  dailyRateCents: number;
  photos: string[];
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  mileage: number;
  location: string | null;
}

export interface RentalBooking {
  id: string;
  bookingCode: string;
  customerId: string;
  fleetVehicleId: string;
  fleetVehicle?: FleetVehicle;
  pickupDate: string;
  returnDate: string;
  deliveryMethod: 'LOT' | 'LAX' | 'HOME';
  deliveryAddress: string | null;
  status: RentalStatus;
  insuranceOption: 'OWN' | 'LAXVALETCARE_PLAN';
  insurancePlan: 'BASIC' | 'STANDARD' | 'PREMIUM' | null;
  insuranceStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  insuranceRejectionReason: string | null;
  agreementSignedAt: string | null;
  priceBreakdown: Reservation['priceBreakdown'];
  totalCents: number;
  depositHoldCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatThread {
  id: string;
  customerId: string;
  status: 'AI' | 'HUMAN_REQUESTED' | 'HUMAN_ACTIVE' | 'CLOSED';
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: 'AI' | 'CUSTOMER' | 'ADMIN';
  adminId: string | null;
  body: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  profileId: string;
  title: string;
  body: string;
  type: string;
  reservationId: string | null;
  rentalBookingId: string | null;
  readAt: string | null;
  createdAt: string;
}
