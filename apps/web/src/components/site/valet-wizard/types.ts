import type { AddOnType, OriginType, ServiceTier, Transmission } from '@laxvaletcare/shared';

export interface ValetWizardData {
  originType: OriginType;

  terminalCode: string;
  airline: string;
  airlineOther: string;

  departureDate: string; // datetime-local input value
  returnDateEstimate: string; // datetime-local input value
  departingAirline: string;
  departingFlightNumber: string;
  returningAirline: string;
  returningFlightNumber: string;
  skipReturnFlight: boolean;
  bagsInfo: string;

  color: string;
  make: string;
  model: string;
  transmission: Transmission;
  plate: string;
  skipPlate: boolean;

  serviceTier: ServiceTier;
  vipPersonCount: number;

  addOns: AddOnType[];

  gratuityCents: number;
  gratuityCustom: string;

  promoCode: string;
}

export const STEP_LABELS = [
  'Origin',
  'Terminal & flight',
  'Vehicle',
  'Service tier',
  'Car care',
  'Gratuity',
  'Review & pay',
  'Confirmation',
] as const;

export function initialWizardData(overrides?: Partial<ValetWizardData>): ValetWizardData {
  return {
    originType: 'LAX',
    terminalCode: '',
    airline: '',
    airlineOther: '',
    departureDate: '',
    returnDateEstimate: '',
    departingAirline: '',
    departingFlightNumber: '',
    returningAirline: '',
    returningFlightNumber: '',
    skipReturnFlight: false,
    bagsInfo: '',
    color: '',
    make: '',
    model: '',
    transmission: 'AUTOMATIC',
    plate: '',
    skipPlate: false,
    serviceTier: 'STANDARD',
    vipPersonCount: 1,
    addOns: [],
    gratuityCents: 0,
    gratuityCustom: '',
    promoCode: '',
    ...overrides,
  };
}
