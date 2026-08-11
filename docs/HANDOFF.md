# LAXValetCare — Handoff

## Live

- **App**: https://laxvaletcare.vercel.app (Vercel project `melokour1s-projects/laxvaletcare`, Root Directory `apps/web`)
- **Database**: Supabase project `laxvaletcare` (ref `modkhbmopyraankxtcfk`, us-west-1), Postgres + Storage, schema + demo seed data applied
- **AI chat**: `ANTHROPIC_API_KEY` configured — "Ask LAXValetCare" works live
- Demo data seeded (`packages/database/migrations/0005_demo_seed.sql`) — fictional customers/valets/reservations/rentals so the admin dashboard isn't empty. Delete freely once real customers exist.

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are already filled in `apps/web/.env.example` — those are public-safe values from the provisioned project, not secrets you need to source.

**If you redeploy via the Vercel CLI yourself**: pipe secret values through a file + `cmd /c "... < file"`, not a direct PowerShell pipe — Windows PowerShell 5.1's pipe-to-external-process encoding embeds a UTF-8 BOM that corrupts the value (cost real debugging time this session).

## API keys / accounts still needed

| Env var | Service | Where to get it | Used for |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | dashboard.supabase.com → laxvaletcare project → Settings → API | Server-side admin DB access (`lib/supabase/admin.ts`) — **never expose to client** |
| `STRIPE_SECRET_KEY` | Stripe | dashboard.stripe.com/test/apikeys | Payments, deposits, refunds, Stripe Identity verification |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Stripe dashboard → Webhooks → your endpoint | Verifying `stripe/webhook` events |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Same dashboard page as secret key | Client-side Stripe.js checkout |
| ~~`ANTHROPIC_API_KEY`~~ | Anthropic | ✅ Already configured (local + Vercel production) | Powers "Ask LAXValetCare" chat |
| `FLIGHTAWARE_API_KEY` | FlightAware AeroAPI | flightaware.com/commercial/aeroapi | Flight lookup for pickup timing |
| `ONFIDO_API_KEY` | Onfido *(optional)* | onfido.com | Alt. identity verification — only needed if not using Stripe Identity |
| `RESEND_API_KEY` | Resend | resend.com | Transactional email (booking confirmations, receipts) |
| `TWILIO_ACCOUNT_SID` | Twilio | twilio.com console | SMS fallback |
| `TWILIO_AUTH_TOKEN` | Twilio | twilio.com console | SMS fallback |
| `TWILIO_FROM_NUMBER` | Twilio | Twilio phone number you purchase | SMS "from" number |
| `FIREBASE_PROJECT_ID` | Firebase | console.firebase.google.com | Push notifications |
| `FIREBASE_CLIENT_EMAIL` | Firebase | Firebase → Project settings → Service accounts | Push notifications (server) |
| `FIREBASE_PRIVATE_KEY` | Firebase | Same service account JSON | Push notifications (server) |
| `NEXT_PUBLIC_FIREBASE_CONFIG` | Firebase | Firebase → Project settings → General → your web app config | Push notifications (client) |

Mobile app (`apps/mobile/.env.example`) only needs `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (same public Supabase values above) and `EXPO_PUBLIC_API_URL` (your deployed web app URL) — no separate secrets.

## Not yet done

- Domains (`laxvaletcare.com`, `admin.`, `valet.` subdomains) not purchased/pointed at Vercel yet — currently only reachable at the `.vercel.app` URL above.
- Firebase project not created.
- Onfido only needed as a fallback; skip unless Stripe Identity doesn't cover your case.
- CI (`.github/workflows/ci.yml`) runs tests + lint on push but not a full build — needs these same secrets added as GitHub repo secrets first.
- One dependency vulnerability (critical, in `tar` via Expo's build tooling, dev-only) deliberately left open — fixing it needs an Expo SDK 51→57 upgrade, its own dedicated task.
