// Mirrors apps/web/src/components/site/valet-wizard/types.ts — same wizard, native UI.
// departureDate/returnDateEstimate are Date objects here (not datetime-local strings)
// since the native date picker works with Date natively; converted to ISO on submit.
import type { AddOnType, OriginType, ServiceTier, Transmission } from '@laxvaletcare/shared';

export interface ValetWizardData {
  originType: OriginType;

  terminalCode: string;
  airline: string;
  airlineOther: string;

  departureDate: Date | null;
  returnDateEstimate: Date | null;
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
] as const;

export function initialValetWizardData(overrides?: Partial<ValetWizardData>): ValetWizardData {
  return {
    originType: 'LAX',
    terminalCode: '',
    airline: '',
    airlineOther: '',
    departureDate: null,
    returnDateEstimate: null,
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
