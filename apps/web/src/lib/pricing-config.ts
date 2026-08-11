import type { PricingConfig } from '@laxvaletcare/shared';
import { createAdminClient } from './supabase/admin';

let cached: { value: PricingConfig; at: number } | null = null;
const CACHE_MS = 60_000;

/** Reads the editable pricing config from app_settings (Admin > Settings writes here). */
export async function getPricingConfig(): Promise<PricingConfig> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('app_settings').select('value').eq('key', 'pricing').single();
  if (error || !data) {
    throw new Error(`pricing config missing from app_settings${error ? `: ${error.message}` : ''}`);
  }
  cached = { value: data.value as PricingConfig, at: Date.now() };
  return cached.value;
}
