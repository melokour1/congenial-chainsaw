# LAXValetCare

Airport valet at LAX + vehicle rentals + car care add-ons.

## Structure

```
apps/
  web/      Next.js app — serves the customer website (laxvaletcare.com),
            the admin backend (admin.laxvaletcare.com) and the valet web app
            (valet.laxvaletcare.com) from one codebase, split by route group
            and host-based middleware.
  mobile/   React Native (Expo) customer app — iOS + Android.
packages/
  database/ Prisma schema (canonical data model) + raw SQL migrations applied
            directly to Supabase via MCP (see packages/database/migrations).
  shared/   Cross-platform TypeScript: enums, pricing calculator, terminal
            directory, Zod validation schemas — imported by both apps/web and
            apps/mobile so business rules never drift between surfaces.
  config/   Design tokens (colors, type scale) shared by web Tailwind config
            and the mobile app's theme.
```

## Cloud infra provisioned this session

- **Supabase project** `laxvaletcare` (`modkhbmopyraankxtcfk`, us-west-1) —
  Postgres + Storage. Schema applied from `packages/database/migrations`.
  Free tier ($0/mo).
- **Vercel** — `apps/web` deployed under the `melokour1's projects` team.

See `docs/HANDOFF.md` for the full list of accounts/API keys still needed to
take this from "working scaffold" to "fully live."

## Local development

```bash
npm install
cp apps/web/.env.example apps/web/.env.local   # fill in secrets
npm run dev:web       # http://localhost:3000
npm run dev:mobile     # Expo dev server
```
