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

2. Create `.env.local` (see [.env.example](.env.example)). You must set `AUTH_SECRET` (e.g. `openssl rand -base64 32`).

3. Apply migrations and seed demo data:

```bash
npx prisma migrate dev
npm run db:seed
```

4. Start the dev server:

```bash
npm run dev
```

5. Log in with seeded accounts:

- Owner: `owner@example.com` / `Owner123!`
- Admin: `admin@staygoldie.local` / `Admin123!`

## Flows

- **Booking**: `/booking` — pick dates & pets → creates `Booking` (PENDING) → Stripe deposit → webhook sets CONFIRMED.
- **Admin pet posts**: `/admin/pet-posts` — image presign (`petId` + admin) or paste image URLs → `createPetPost` Server Action.

## Stripe

- Use **Checkout** via `POST /api/stripe/checkout` (`shop_order` or `booking_deposit`).
- Point Stripe CLI or dashboard webhooks to `POST /api/stripe/webhook` with your `STRIPE_WEBHOOK_SECRET`.

## Main Routes

- `/` landing page
- `/services`, `/booking`, `/shop`, `/pet-feed`, `/blog`
- `/account/*` (authenticated)
- `/admin/*` (admin role only)

## API

- `POST /api/stripe/checkout` — create Stripe Checkout session
- `POST /api/stripe/webhook` — Stripe events (verify signature; idempotent by event id)
- `POST /api/upload/presign` — presigned PUT for private vaccine files (requires S3 env vars)
- `GET/POST /api/auth/*` — Auth.js

## Notes

- Middleware protects `/account`, `/pet-feed`, and `/admin` using JWT (`getToken` + `AUTH_SECRET`).
- Configure `NEXT_PUBLIC_APP_URL` / `AUTH_URL` for production callbacks on Vercel.
