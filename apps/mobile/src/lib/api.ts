import { API_URL, supabase } from './supabase';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Thin fetch wrapper for the apps/web REST API under /api/**.
 *
 * NOTE (known integration gap, documented in BUILD_NOTES.md): apps/web's API
 * routes currently authenticate via @supabase/ssr reading cookies set by the
 * Next.js browser client. This mobile client instead sends the Supabase
 * session's access token as a standard `Authorization: Bearer <token>`
 * header, which is the correct approach for a native client — but it means
 * each apps/web route needs to also accept a bearer token (e.g. by calling
 * `supabase.auth.getUser(token)` when no cookie session is present) before
 * mobile requests will authenticate against a real deployment. Until that
 * small server-side change ships, POST/GET calls below will 401 against a
 * live apps/web unless it's updated to also read the bearer token.
 */
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = json?.error ? (typeof json.error === 'string' ? json.error : JSON.stringify(json.error)) : res.statusText;
    throw new ApiError(message, res.status, json);
  }
  return json as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
};
