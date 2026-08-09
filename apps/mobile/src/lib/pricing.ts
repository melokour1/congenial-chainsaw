import type { PricingConfig } from '@laxvaletcare/shared';
import { supabase } from './supabase';

// Mirrors the seed row in packages/database/migrations/0003_seed.sql —
// used only if the app_settings("pricing") row can't be reached, so pricing
// screens never crash / show blank numbers while offline or misconfigured.
export const FALLBACK_PRICING: PricingConfig = {
  valet: { standardPerDayCents: 4695, vipExpressPerPersonCents: 50000, vipElitePerPersonCents: 200000 },
  carCare: { handWashCents: 6995, fullDetailCents: 49995, evChargeCents: 4595, gasFillUpCents: null },
  crossAirport: { burbankCents: 20000, johnWayneCents: 25000 },
  rental: {
    classDailyRateCents: { ECONOMY: 4500, STANDARD: 6500, SUV: 8500, PREMIUM: 12000, LUXURY: 20000, VAN: 15000 },
    deliveryCents: { LOT: 0, LAX: 5000, HOME: 3500 },
    weeklyDiscountPct: 17.5,
    monthlyDiscountPct: 35,
  },
  rentalInsurance: { basicPerDayCents: 1500, standardPerDayCents: 2500, premiumPerDayCents: 4000 },
  taxPct: 10,
  serviceFeePct: 12.5,
  securityDepositCents: { min: 50000, max: 100000 },
};

let cached: PricingConfig | null = null;

/** Reads live pricing straight from Supabase (public-read app_settings row) — no server round trip needed. */
export async function getPricingConfig(): Promise<PricingConfig> {
  if (cached) return cached;
  try {
    const { data, error } = await supabase.from('app_settings').select('value').eq('key', 'pricing').single();
    if (error || !data?.value) return FALLBACK_PRICING;
    cached = data.value as PricingConfig;
    return cached;
  } catch {
    return FALLBACK_PRICING;
  }
}
