import { NextResponse } from 'next/server';

/**
 * Flight status lookup by flight number, used to auto-detect landing (Return Day Stage 1).
 * Falls back to a clearly-labeled mock when FLIGHTAWARE_API_KEY isn't set, so the return-day
 * flow is still testable end-to-end without a live AeroAPI account.
 */
export async function GET(request: Request) {
  const flightNumber = new URL(request.url).searchParams.get('flightNumber');
  if (!flightNumber) return NextResponse.json({ error: 'flightNumber is required' }, { status: 400 });

  if (!process.env.FLIGHTAWARE_API_KEY) {
    return NextResponse.json({
      flightNumber,
      status: 'SCHEDULED',
      mock: true,
      note: 'FLIGHTAWARE_API_KEY not set — returning mock data. Get a key at flightaware.com/commercial/aeroapi.',
    });
  }

  const res = await fetch(`https://aeroapi.flightaware.com/aeroapi/flights/${encodeURIComponent(flightNumber)}`, {
    headers: { 'x-apikey': process.env.FLIGHTAWARE_API_KEY },
    next: { revalidate: 60 },
  });
  if (!res.ok) return NextResponse.json({ error: 'FlightAware lookup failed' }, { status: res.status });
  const data = await res.json();
  return NextResponse.json({ flightNumber, mock: false, data });
}
