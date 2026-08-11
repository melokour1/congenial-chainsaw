/**
 * Runs once when the server starts (Next.js instrumentation hook — see
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation).
 * Logs a clear, up-front list of missing env vars instead of letting each one surface
 * as a separate crash deep inside whichever route hits it first. Doesn't throw — some
 * of these are genuinely optional (see apps/web/.env.example for what each does) and
 * already degrade gracefully in the routes that use them.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const optional = [
    'STRIPE_SECRET_KEY',
    'ANTHROPIC_API_KEY',
    'FLIGHTAWARE_API_KEY',
    'RESEND_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'FIREBASE_PROJECT_ID',
  ];

  const missingRequired = required.filter((k) => !process.env[k]);
  const missingOptional = optional.filter((k) => !process.env[k]);

  if (missingRequired.length) {
    // eslint-disable-next-line no-console
    console.error(
      `\n⚠️  Missing required env vars: ${missingRequired.join(', ')}\n` +
      `   The app will not function correctly. See apps/web/.env.example.\n`,
    );
  }
  if (missingOptional.length) {
    // eslint-disable-next-line no-console
    console.warn(
      `\nℹ️  Optional integrations not configured (features degrade gracefully): ${missingOptional.join(', ')}\n`,
    );
  }
}
