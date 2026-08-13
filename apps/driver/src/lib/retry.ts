/**
 * Retries an idempotent async operation (GET-style reads: profile/jobs/stats
 * polling) a few times with exponential backoff before giving up, so a single
 * dropped packet on spotty airport Wi-Fi doesn't read as a real failure.
 *
 * Deliberately NOT used for POST-style actions (clock in/out, job actions,
 * status changes) — those aren't safe to blindly retry without knowing
 * whether the first attempt actually landed server-side, so those surface
 * their error immediately instead and let the driver decide to retry.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const { retries = 2, baseDelayMs = 600 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = baseDelayMs * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}
