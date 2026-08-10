import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Host-based routing for the three surfaces sharing this codebase:
 *  - admin.laxvaletcare.com  → /admin/*
 *  - valet.laxvaletcare.com  → /valet/*
 *  - laxvaletcare.com (or any other host, e.g. localhost) → customer site "/"
 * Also refreshes the Supabase auth session cookie on every request.
 */
export async function middleware(request: NextRequest) {
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

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
