// Pure pricing calculators shared by web + mobile + server API routes.
// The numbers themselves live in the `app_settings` table (key: "pricing") so
// admins can edit them from Admin > Settings without a redeploy; these
// functions just apply the math consistently everywhere.

import type { AddOnType, DeliveryMethod, RentalClass, ServiceTier } from './enums';

export interface PricingConfig {
  valet: {
    standardPerDayCents: number;
    vipExpressPerPersonCents: number;
    vipElitePerPersonCents: number;
  };
  carCare: {
    handWashCents: number;
    fullDetailCents: number;
    evChargeCents: number;
    gasFillUpCents: number | null;
  };
  crossAirport: {
    burbankCents: number;
    johnWayneCents: number;
  };
  rental: {
    classDailyRateCents: Record<RentalClass, number>;
    deliveryCents: Record<DeliveryMethod, number>;
    weeklyDiscountPct: number;
    monthlyDiscountPct: number;
  };
  rentalInsurance: {
    basicPerDayCents: number;
    standardPerDayCents: number;
    premiumPerDayCents: number;
  };
  taxPct: number;
  serviceFeePct: number;
  securityDepositCents: { min: number; max: number };
}

export interface LineItem {
  label: string;
  cents: number;
  /** Optional rate math shown under the label, e.g. "$46.95/day × 3 days" — how
   * `cents` was arrived at, for line items priced by a rate × quantity. Omitted
   * for flat one-time fees, where the label already says everything. */
  detail?: string;
}

export interface PriceBreakdown {
  lineItems: LineItem[];
  subtotalCents: number;
  taxCents: number;
  /** The tax rate applied to subtotalCents, for display (e.g. "Tax (10%)"). */
  taxPct: number;
  serviceFeeCents: number;
  /** The service fee rate applied to subtotalCents, for display. */
  serviceFeePct: number;
  gratuityCents: number;
  totalCents: number;
}

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function sumAndFinalize(
  lineItems: LineItem[],
  pricing: PricingConfig,
  gratuityCents = 0,
): PriceBreakdown {
  const subtotalCents = lineItems.reduce((sum, li) => sum + li.cents, 0);
  const taxCents = Math.round(subtotalCents * (pricing.taxPct / 100));
  const serviceFeeCents = Math.round(subtotalCents * (pricing.serviceFeePct / 100));
  const totalCents = subtotalCents + taxCents + serviceFeeCents + gratuityCents;
  return {
    lineItems,
    subtotalCents,
    taxCents,
    taxPct: pricing.taxPct,
    serviceFeeCents,
    serviceFeePct: pricing.serviceFeePct,
    gratuityCents,
    totalCents,
  };
}

export interface ValetPricingInput {
  departureDate: Date;
  returnDateEstimate: Date;
  serviceTier: ServiceTier;
  vipPersonCount?: number; // for VIP Express/Elite per-person fee
  addOns?: AddOnType[];
  gratuityCents?: number;
}

const ADD_ON_LABEL: Record<AddOnType, string> = {
  HAND_WASH: 'Hand Wash',
  FULL_DETAIL: 'Full Detail',
  EV_CHARGE: 'EV Charge',
  GAS_FILL_UP: 'Gas Fill-Up',
};

export function calcValetPrice(input: ValetPricingInput, pricing: PricingConfig): PriceBreakdown {
  const days = daysBetween(input.departureDate, input.returnDateEstimate);
  const dayWord = (n: number) => `${n} day${n === 1 ? '' : 's'}`;
  const personWord = (n: number) => `${n} person${n === 1 ? '' : 's'}`;

  const lineItems: LineItem[] = [
    {
      label: `Standard valet — ${dayWord(days)}`,
      cents: pricing.valet.standardPerDayCents * days,
      detail: `${formatCents(pricing.valet.standardPerDayCents)}/day × ${dayWord(days)}`,
    },
  ];

  if (input.serviceTier === 'VIP_EXPRESS') {
    const people = input.vipPersonCount ?? 1;
    lineItems.push({
      label: `VIP Express (${personWord(people)})`,
      cents: pricing.valet.vipExpressPerPersonCents * people,
      detail: `${formatCents(pricing.valet.vipExpressPerPersonCents)}/person × ${personWord(people)}`,
    });
  } else if (input.serviceTier === 'VIP_ELITE') {
    const people = input.vipPersonCount ?? 1;
    lineItems.push({
      label: `VIP Elite (${personWord(people)})`,
      cents: pricing.valet.vipElitePerPersonCents * people,
      detail: `${formatCents(pricing.valet.vipElitePerPersonCents)}/person × ${personWord(people)}`,
    });
  }

  for (const addOn of input.addOns ?? []) {
    const cents =
      addOn === 'HAND_WASH' ? pricing.carCare.handWashCents :
      addOn === 'FULL_DETAIL' ? pricing.carCare.fullDetailCents :
      addOn === 'EV_CHARGE' ? pricing.carCare.evChargeCents :
      pricing.carCare.gasFillUpCents ?? 0;
    lineItems.push({ label: ADD_ON_LABEL[addOn], cents });
  }

  return sumAndFinalize(lineItems, pricing, input.gratuityCents ?? 0);
}

export interface RentalPricingInput {
  pickupDate: Date;
  returnDate: Date;
  rentalClass: RentalClass;
  deliveryMethod: DeliveryMethod;
  insurance:
    | { option: 'OWN' }
    | { option: 'LAXVALETCARE_PLAN'; plan: 'BASIC' | 'STANDARD' | 'PREMIUM' };
  extraDriverCents?: number;
  childSeatCents?: number;
}

export function calcRentalPrice(input: RentalPricingInput, pricing: PricingConfig): PriceBreakdown {
  const days = daysBetween(input.pickupDate, input.returnDate);
  const dayWord = (n: number) => `${n} day${n === 1 ? '' : 's'}`;
  const dailyRate = pricing.rental.classDailyRateCents[input.rentalClass];
  let rentalCents = dailyRate * days;

  let discountLabel: string | null = null;
  let discountDetail: string | null = null;
  if (days >= 30) {
    rentalCents = Math.round(rentalCents * (1 - pricing.rental.monthlyDiscountPct / 100));
    discountLabel = `Monthly discount (${pricing.rental.monthlyDiscountPct}% off)`;
    discountDetail = `, less ${pricing.rental.monthlyDiscountPct}% monthly discount`;
  } else if (days >= 7) {
    rentalCents = Math.round(rentalCents * (1 - pricing.rental.weeklyDiscountPct / 100));
    discountLabel = `Weekly discount (${pricing.rental.weeklyDiscountPct}% off)`;
    discountDetail = `, less ${pricing.rental.weeklyDiscountPct}% weekly discount`;
  }

  const lineItems: LineItem[] = [
    {
      label: `${input.rentalClass} — ${dayWord(days)}${discountLabel ? ` (${discountLabel})` : ''}`,
      cents: rentalCents,
      detail: `${formatCents(dailyRate)}/day × ${dayWord(days)}${discountDetail ?? ''}`,
    },
  ];

  const deliveryCents = pricing.rental.deliveryCents[input.deliveryMethod];
  if (deliveryCents > 0) {
    lineItems.push({ label: `Delivery (${input.deliveryMethod})`, cents: deliveryCents });
  }

  if (input.insurance.option === 'LAXVALETCARE_PLAN') {
    const perDay =
      input.insurance.plan === 'BASIC' ? pricing.rentalInsurance.basicPerDayCents :
      input.insurance.plan === 'STANDARD' ? pricing.rentalInsurance.standardPerDayCents :
      pricing.rentalInsurance.premiumPerDayCents;
    lineItems.push({
      label: `${input.insurance.plan} protection plan — ${dayWord(days)}`,
      cents: perDay * days,
      detail: `${formatCents(perDay)}/day × ${dayWord(days)}`,
    });
  }

  if (input.extraDriverCents) {
    lineItems.push({
      label: 'Extra driver',
      cents: input.extraDriverCents,
      detail: `${formatCents(EXTRA_DRIVER_CENTS_PER_DAY)}/day × ${dayWord(days)}`,
    });
  }
  if (input.childSeatCents) {
    lineItems.push({
      label: 'Child seat',
      cents: input.childSeatCents,
      detail: `${formatCents(CHILD_SEAT_CENTS_PER_DAY)}/day × ${dayWord(days)}`,
    });
  }

  return sumAndFinalize(lineItems, pricing);
}

export const EXTRA_DRIVER_CENTS_PER_DAY = 1500;
export const CHILD_SEAT_CENTS_PER_DAY = 1000;

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
