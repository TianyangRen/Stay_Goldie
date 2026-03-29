# Stay Goldie

Boutique dog boarding website with:

- Fully responsive marketing site
- **Auth.js** (Credentials) + **PostgreSQL** + Prisma
- Stripe Checkout (CAD) + signed webhooks + idempotent event handling
- S3-compatible presigned uploads (e.g. Cloudflare R2) for private files
- Resend for transactional email (optional when `RESEND_API_KEY` is set)
- **Updates feed** (`/blog`) — social-style posts with **likes** and **comments** (stored in Postgres)
- **Profiles** — display name + avatar tied to the account email; **posting personas** (admin) for posting “as” a named pet

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
- **Updates (public feed)**: `/blog` — short posts; logged-in users can **like** and **comment**. Display name/avatar come from the author’s profile or from an optional **posting persona** (admin).
- **Owner updates**: `/account/updates` — owners publish to the same public feed (no personas).
- **Admin updates & personas**: `/admin/blog` — compose posts, manage **posting personas** (saved name + avatar per “pet voice”), publish as self or as a persona.
- **Profile**: `/account/profile` — edit **display name** and **avatar** (URL or presigned image upload when S3 is configured). **Email** is read-only (login identity). Admins can open this route while other `/account/*` paths redirect to `/admin`.

## Stripe

- Use **Checkout** via `POST /api/stripe/checkout` (`shop_order` or `booking_deposit`).
- Point Stripe CLI or dashboard webhooks to `POST /api/stripe/webhook` with your `STRIPE_WEBHOOK_SECRET`.
- **Local webhook (Windows)**: If Scoop’s `stripe` shim fails, this repo includes `tools/stripe-cli/stripe.exe` (gitignored; run the download command from onboarding or ask a teammate). Then: `tools\stripe-cli\stripe.exe login` once, and `scripts\stripe-listen.cmd` to forward events (keep that window open).

## Main Routes

- `/` landing page
- `/services`, `/booking`, `/shop`, `/pet-feed`, `/blog` (Updates)
- `/privacy`, `/terms` (placeholders for Path B)
- `/account/*` (authenticated); `/account/profile` also allowed for admins
- `/account/updates`, `/account/updates/new` (owners — publish updates)
- `/admin/*` (admin role only); `/admin/blog` — staff feed + personas

## API

- `POST /api/stripe/checkout` — create Stripe Checkout session
- `POST /api/stripe/webhook` — Stripe events (verify signature; idempotent by event id)
- `POST /api/upload/presign` — presigned PUT for images (`purpose`: `default` | `profile` | `update_cover` | `persona`, optional `petId` / `personaId`; requires S3 env vars). Set `S3_PUBLIC_BASE_URL` so clients receive a public URL after upload.
- `GET/POST /api/auth/*` — Auth.js

## Notes

- Middleware protects `/account`, `/pet-feed`, and `/admin` using JWT (`getToken` + `AUTH_SECRET`). Admins are redirected from most `/account` routes to `/admin`, except **`/account/profile`**.
- **Registration**: `/register` creates owner accounts (see `register` Server Action). Seeded accounts remain useful for demos.
- **Database**: `BlogPostLike`, `BlogPostComment`, and `PostingPersona` support engagement and admin “pet voice” posting; run `npm run db:push:direct` after pulling schema changes.
