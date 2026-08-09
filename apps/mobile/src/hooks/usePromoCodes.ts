import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED_CENTS' | 'FREE_SERVICE';
  discountValue: number;
  active: boolean;
  expiresAt: string | null;
}

export function usePromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('promo_codes')
      .select('*')
      .eq('active', true)
      .then(({ data }) => {
        if (!cancelled) setPromoCodes((data as PromoCode[]) ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { promoCodes, loading };
}
