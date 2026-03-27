# Stay Goldie

Boutique dog boarding website with:

- Fully responsive marketing site
- **Auth.js** (Credentials) + **PostgreSQL** + Prisma
- Stripe Checkout (CAD) + signed webhooks + idempotent event handling
- S3-compatible presigned uploads (e.g. Cloudflare R2) for private files
- Resend for transactional email (optional when `RESEND_API_KEY` is set)

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS + Framer Motion
- PostgreSQL + Prisma ORM
- Stripe / Resend / S3-compatible storage

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Copy [.env.example](.env.example) to `.env` and fill values. Set `AUTH_SECRET` (e.g. `openssl rand -base64 32`).

3. Sync the database schema and seed demo data (Supabase: use **Session pooler** for `DIRECT_URL` if your network has no IPv6; see comments in `.env.example`):

```bash
npm run db:push:direct
npm run db:seed
```

4. Start the dev server:

```bash
npm run dev
```

5. Log in with seeded accounts:

- Owner: `owner@example.com` / `Owner123!`
- Admin: `admin@staygoldie.local` / `Admin123!`

## Path B: minimum real-payments launch

Use this checklist before taking **live** Stripe payments:

1. **Environment**: In hosting (e.g. Vercel), set the same variables as `.env.example` — at minimum `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Use **production** Stripe keys and webhook secret.
2. **URLs**: `AUTH_URL` and `NEXT_PUBLIC_APP_URL` must be your **public https origin** (no trailing path). Stripe Checkout success/cancel URLs use `NEXT_PUBLIC_APP_URL`.
3. **Webhook**: In Stripe Dashboard, add endpoint `https://YOUR_DOMAIN/api/stripe/webhook`, select `checkout.session.completed`, use the signing secret as `STRIPE_WEBHOOK_SECRET`.
4. **Contact & legal**: Set `NEXT_PUBLIC_CONTACT_EMAIL` (and optionally `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_BUSINESS_NAME`). Replace placeholder copy on `/privacy` and `/terms` with lawyer-reviewed text when ready.
5. **Email (recommended)**: Configure Resend + verified domain so order/booking emails deliver; without `RESEND_API_KEY`, payment still works but emails are skipped.
6. **Build**: Run `npm run build` locally or in CI before deploy.

## Flows

- **Booking**: `/booking` — pick dates & pets → creates `Booking` (PENDING) → Stripe deposit → webhook sets CONFIRMED.
- **Admin pet posts**: `/admin/pet-posts` — image presign (`petId` + admin) or paste image URLs → `createPetPost` Server Action.

## Stripe

- Use **Checkout** via `POST /api/stripe/checkout` (`shop_order` or `booking_deposit`).
- Point Stripe CLI or dashboard webhooks to `POST /api/stripe/webhook` with your `STRIPE_WEBHOOK_SECRET`.
- **Local webhook (Windows)**: If Scoop’s `stripe` shim fails, this repo includes `tools/stripe-cli/stripe.exe` (gitignored; run the download command from onboarding or ask a teammate). Then: `tools\stripe-cli\stripe.exe login` once, and `scripts\stripe-listen.cmd` to forward events (keep that window open).

## Main Routes

- `/` landing page
- `/services`, `/booking`, `/shop`, `/pet-feed`, `/blog`
- `/privacy`, `/terms` (placeholders for Path B)
- `/account/*` (authenticated)
- `/admin/*` (admin role only)

## API

- `POST /api/stripe/checkout` — create Stripe Checkout session
- `POST /api/stripe/webhook` — Stripe events (verify signature; idempotent by event id)
- `POST /api/upload/presign` — presigned PUT for private vaccine files (requires S3 env vars)
- `GET/POST /api/auth/*` — Auth.js

## Notes

- Middleware protects `/account`, `/pet-feed`, and `/admin` using JWT (`getToken` + `AUTH_SECRET`).
- Path B still assumes **manual or seeded users**; self-serve registration is a later iteration.
