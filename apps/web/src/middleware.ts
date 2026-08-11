import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Host-based routing for the three surfaces sharing this codebase:
 *  - admin.laxvaletcare.com  → /admin/*
 *  - valet.laxvaletcare.com  → /valet/*
 *  - laxvaletcare.com (or any other host, e.g. localhost) → customer site "/"
 * Also refreshes the Supabase auth session cookie on every request.
 *
 * CORS for /api/**: apps/mobile calls this API cross-origin (native Metro/Expo
 * dev server on a different port, and Expo's web target runs as an actual
 * browser page — unlike iOS/Android, browser CORS applies there). We reflect
 * the request's Origin rather than using "*" so credentialed/bearer requests
 * work from any client without maintaining an allowlist; there's no cookie-based
 * auth surface here for a hostile page to ride on (mobile authenticates via an
 * Authorization header it must already possess, not ambient cookies).
 */
function withCors(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname: apiPathname } = request.nextUrl;
  if (apiPathname.startsWith('/api')) {
    if (request.method === 'OPTIONS') {
      return withCors(new NextResponse(null, { status: 204 }), request);
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  await supabase.auth.getUser();

  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  const isAlreadyScoped = pathname.startsWith('/admin') || pathname.startsWith('/valet') || pathname.startsWith('/api');

  if (!isAlreadyScoped) {
    if (host.startsWith('admin.')) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url, { headers: response.headers });
    }
    if (host.startsWith('valet.')) {
      const url = request.nextUrl.clone();
      url.pathname = `/valet${pathname}`;
      return NextResponse.rewrite(url, { headers: response.headers });
    }
  }

  if (pathname.startsWith('/api')) {
    return withCors(response, request);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
