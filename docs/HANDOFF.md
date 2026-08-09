# LAXValetCare — Handoff

## Already provisioned (this session)

| Service | What | Status |
|---|---|---|
| Supabase | Project `laxvaletcare` (ref `modkhbmopyraankxtcfk`, us-west-1), Postgres + Storage, schema migrated | ✅ Live, free tier |
| Vercel | `apps/web` deployed under `melokour1's projects` | ✅ Deployed |

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are already filled in `apps/web/.env.example` — those are public-safe values from the provisioned project, not secrets you need to source.

## API keys / accounts still needed

| Env var | Service | Where to get it | Used for |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | dashboard.supabase.com → laxvaletcare project → Settings → API | Server-side admin DB access (`lib/supabase/admin.ts`) — **never expose to client** |
| `STRIPE_SECRET_KEY` | Stripe | dashboard.stripe.com/test/apikeys | Payments, deposits, refunds, Stripe Identity verification |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Stripe dashboard → Webhooks → your endpoint | Verifying `stripe/webhook` events |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Same dashboard page as secret key | Client-side Stripe.js checkout |
| `ANTHROPIC_API_KEY` | Anthropic | console.anthropic.com | Powers "Ask LAXValetCare" chat |
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

- Domains (`laxvaletcare.com`, `admin.`, `valet.` subdomains) not purchased/pointed at Vercel yet.
- No git repository initialized locally — no version history exists yet.
- Firebase project not created.
- Onfido only needed as a fallback; skip unless Stripe Identity doesn't cover your case.
