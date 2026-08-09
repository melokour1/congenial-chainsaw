export interface ValetProfile {
  id: string;
  role: 'CUSTOMER' | 'VALET' | 'ADMIN';
  fullName: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  valetStatus: 'AVAILABLE' | 'BUSY' | 'BREAK' | 'OFF' | null;
  queuePosition: number | null;
  clockedInAt: string | null;
  sessionExpiresAt: string | null;
}

export interface Terminal {
  id: string;
  code: string;
  name: string;
  isOffSite?: boolean;
  offSiteAddress?: string | null;
}

export interface AddOn {
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
  url: string;
  stage: 'PICKUP' | 'RETURN' | 'ADDON' | 'RENTAL_PICKUP' | 'RENTAL_RETURN';
  takenByValetId: string | null;
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  reservationId: string | null;
  actorId: string | null;
  action: string;
  detail: unknown;
  createdAt: string;
}

export interface ReservationCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export interface ReservationJob {
  id: string;
  bookingCode: string;
  customerId: string;
  customer: ReservationCustomer;
  originType: 'LAX' | 'JSX' | 'ATLANTIC_AVIATION';
  terminalId: string | null;
  terminal: Terminal | null;
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
  addOns: AddOn[];
  gratuityCents: number;
  status: string;
  departureValetId: string | null;
  returnValetId: string | null;
  departureValet: { id: string; fullName: string; photoUrl: string | null } | null;
  returnValet: { id: string; fullName: string; photoUrl: string | null } | null;
  customerEtaBand: string | null;
  customerEtaMinutes: number | null;
  customerOnWayAt: string | null;
  flightLandedAt: string | null;
  customerAtCurbAt: string | null;
  curbLocationDetail: string | null;
  photos: Photo[];
  activityLogs: ActivityLogEntry[];
  notes: string | null;
  _asDeparture?: boolean;
  _asReturn?: boolean;
}

export interface JobOfferSummary {
  id: string;
  reservationId: string | null;
  valetId: string;
  jobType: 'DEPARTURE' | 'RETURN_STAGE1' | 'RETURN_STAGE2';
  offeredAt: string;
  response: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  roundNumber: number;
  reservation: {
    id: string;
    bookingCode: string;
    vehicleColor: string;
    vehicleMake: string;
    vehicleModel: string;
    transmission: 'AUTOMATIC' | 'MANUAL';
    plate: string | null;
    terminal: { code: string } | null;
    customer: { fullName: string } | null;
  } | null;
}

/** A single card's worth of work: a reservation in the context of either its departure or return leg. */
export interface Assignment {
  type: 'DEPARTURE' | 'RETURN';
  reservation: ReservationJob;
}
