import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

/**
 * Server Components / Route Handlers / Server Actions — respects RLS as the signed-in user.
 *
 * Also transparently supports the mobile app: apps/mobile has no cookies to send, so it
 * authenticates every request with `Authorization: Bearer <access_token>` instead (see
 * apps/mobile/src/lib/api.ts). Two separate things need that token when it's present:
 *
 *  1. `supabase.auth.getUser()` — every route handler in this codebase calls it with no
 *     arguments, so we patch `getUser()` to fall back to validating the bearer token
 *     directly against the auth server when no cookie session already satisfies it.
 *  2. Every `.from(...)` / PostgREST call the route makes afterwards — these go out over
 *     `global.headers.Authorization`, which for a cookie session @supabase/ssr wires up
 *     from the session it parsed out of cookies. A bearer caller has no cookie session, so
 *     without also forwarding the token there, PostgREST sees no JWT, evaluates RLS as the
 *     anonymous role, and silently returns zero rows on every SELECT — no error, just an
 *     empty result set that looks like "no data" instead of "not authenticated as you".
 *     (Caught in testing: POST /api/reservations appeared to work because it writes through
 *     the service-role admin client, which bypasses RLS — but the follow-up GET came back
 *     empty even though the row existed and belonged to the right user.)
 */
export async function createClient() {
  const cookieStore = await cookies();
  const authHeader = (await headers()).get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // called from a Server Component — middleware handles session refresh instead
          }
        },
      },
      global: bearerToken ? { headers: { Authorization: `Bearer ${bearerToken}` } } : undefined,
    },
  );

  if (bearerToken) {
    const originalGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = ((jwt?: string) => originalGetUser(jwt ?? bearerToken)) as typeof client.auth.getUser;
  }

  return client;
}
