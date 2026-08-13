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
 * Thin fetch wrapper for apps/web's REST API under /api/** — the same backend
 * apps/web's own /valet portal and apps/mobile's customer app both hit.
 * apps/web's Supabase server client (apps/web/src/lib/supabase/server.ts)
 * accepts a standard `Authorization: Bearer <token>` header as a fallback for
 * clients with no cookies, which is what makes this work for a native app.
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
