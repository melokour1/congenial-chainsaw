/**
 * A cheap client-side placeholder ID for optimistic UI updates (e.g. an
 * activity log entry or photo row we render immediately, before the next
 * poll replaces it with the server's real row). Not `crypto.randomUUID()` —
 * that's not guaranteed to exist in the Hermes RN runtime without a polyfill,
 * and these IDs never need to be cryptographically unique or stored anywhere.
 */
export function localId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
