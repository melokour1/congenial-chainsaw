import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role client — bypasses Row Level Security entirely.
 * Server-only (API routes / route handlers). NEVER import from a Client Component.
 * Requires SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Settings → API → service_role,
 * not returned by the provisioning MCP tools for security — add it to your env yourself).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it from the Supabase dashboard (Settings → API) ' +
      'to apps/web/.env.local — admin/valet privileged operations need it to bypass RLS.',
    );
  }
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
