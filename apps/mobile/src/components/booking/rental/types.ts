import type { DeliveryMethod, InsurancePlanTier } from '@laxvaletcare/shared';
export { EXTRA_DRIVER_CENTS_PER_DAY, CHILD_SEAT_CENTS_PER_DAY } from '@laxvaletcare/shared';

export interface RentalWizardData {
  pickupDate: Date | null;
  returnDate: Date | null;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;

  fleetVehicleId: string;

  // Identity verification
  dlNumber: string;
  dlState: string;
  dlExpiry: Date | null;
  dob: Date | null;
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

export function initialRentalWizardData(overrides?: Partial<RentalWizardData>): RentalWizardData {
  return {
    pickupDate: null,
    returnDate: null,
    deliveryMethod: 'LOT',
    deliveryAddress: '',
    fleetVehicleId: '',
    dlNumber: '',
    dlState: '',
    dlExpiry: null,
    dob: null,
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
