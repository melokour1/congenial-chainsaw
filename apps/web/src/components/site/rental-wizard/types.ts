import type { DeliveryMethod, InsurancePlanTier, RentalClass } from '@laxvaletcare/shared';

export interface FleetVehicleRow {
  id: string;
  class: RentalClass;
  make: string;
  model: string;
  year: number;
  color: string;
  dailyRateCents: number;
  mileage: number;
  location: string | null;
  status: string;
}

export interface RentalWizardData {
  pickupDate: string; // datetime-local
  returnDate: string; // datetime-local
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;

  fleetVehicleId: string;

  // Identity verification
  dlNumber: string;
  dlState: string;
  dlExpiry: string; // date input
  dob: string; // date input
  fullLegalName: string;
  addressStreet: string;
  addressUnit: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  dlFrontUrl: string;
  dlBackUrl: string;
  selfieUrl: string;

  // Insurance
  insuranceOption: 'OWN' | 'LAXVALETCARE_PLAN';
  insuranceCompany: string;
  insurancePolicyNumber: string;
  insurancePlan: InsurancePlanTier;
  insuranceCardFrontUrl: string;
  insuranceCardBackUrl: string;

  // Agreement
  agreementChecked: boolean;
  signatureUrl: string;

  // Add-ons
  extraDriver: boolean;
  childSeat: boolean;
}

export const STEP_LABELS = [
  'Dates & delivery',
  'Choose a vehicle',
  'Verification & insurance',
  'Rental agreement',
  'Add-ons',
  'Review & pay',
  'Confirmation',
] as const;

export const EXTRA_DRIVER_CENTS_PER_DAY = 1500;
export const CHILD_SEAT_CENTS_PER_DAY = 1000;

export function initialRentalWizardData(overrides?: Partial<RentalWizardData>): RentalWizardData {
  return {
    pickupDate: '',
    returnDate: '',
    deliveryMethod: 'LOT',
    deliveryAddress: '',
    fleetVehicleId: '',
    dlNumber: '',
    dlState: '',
    dlExpiry: '',
    dob: '',
    fullLegalName: '',
    addressStreet: '',
    addressUnit: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    dlFrontUrl: '',
    dlBackUrl: '',
    selfieUrl: '',
    insuranceOption: 'OWN',
    insuranceCompany: '',
    insurancePolicyNumber: '',
    insurancePlan: 'BASIC',
    insuranceCardFrontUrl: '',
    insuranceCardBackUrl: '',
    agreementChecked: false,
    signatureUrl: '',
    extraDriver: false,
    childSeat: false,
    ...overrides,
  };
}
