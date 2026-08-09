import { NextResponse } from 'next/server';
import { getPricingConfig } from '@/lib/pricing-config';

export async function GET() {
  const pricing = await getPricingConfig();
  return NextResponse.json(pricing);
}
