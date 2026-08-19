# Streetcast

A two-sided marketplace matching brands with everyday people for local
photoshoots, promo work, and content gigs — Tinder-style swiping, Airtasker-style
local gig matching.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind v4)
- **Supabase** — Postgres database, auth, storage
- **Stripe** — escrow payments (Connect) + identity verification (Identity)
- **Capacitor** — wraps this same codebase into native iOS/Android apps later

## What's built

- Full project scaffold, folder structure, and design system (Apple-inspired —
  see `globals.css` for the token set)
- Database schema with row-level security (`supabase/schema.sql`)
- Swipe deck mechanics as reusable components (`components/swipe/`) — drag
  physics, tap-vs-swipe detection, stacked-card rendering
- Talent-facing gig discovery (`/talent/discover`) and brand-facing talent
  discovery (`/brand/discover`), both wired to mock data
- Full profile detail sheet with past jobs, interests, and reviews
- Signup/login pages wired to real Supabase auth, including a hard 18+ check
  (client-side AND a database constraint — see `must_be_adult` in schema.sql)
- Map view for brands — currently a distance-sorted list placeholder, see
  "Next steps" below for wiring in a real map SDK
- Stripe webhook route stub for payment + identity verification events

**Everything currently runs on mock data** (`src/lib/mock-data.ts`) so you can
`npm run dev` and click through the whole flow before any backend is connected.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase + Stripe keys
npm run dev
```

Visit `http://localhost:3000`.

### Setting up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run `supabase/schema.sql`
3. Copy your Project URL and anon key into `.env.local`
4. Generate real TypeScript types (replaces the placeholder in
   `src/types/database.types.ts`):
   ```bash
   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
   ```

### Setting up Stripe

1. Create a [Stripe](https://stripe.com) account, grab your test keys
2. Enable **Stripe Connect** (Express accounts) for the escrow flow
3. Enable **Stripe Identity** for ID verification
4. Point a webhook endpoint at `/api/stripe/webhook` and copy the signing
   secret into `.env.local`

## Next steps for Claude Code

Roughly in priority order:

1. **Wire real data everywhere mock data is used.** Every page that uses
   `mockGigs` / `mockTalent` has a `TODO` comment showing the Supabase query
   that should replace it.
2. **ID verification flow.** Add a Stripe Identity verification step to
   onboarding (after signup, before a talent can swipe or a brand can post).
   Block core actions until `id_verification_status = 'verified'`.
3. **Business verification for brands.** ABN/business-registration check
   before a brand's gigs can go live.
4. **Escrow payments.** When a brand books someone from a shortlist, create a
   Stripe PaymentIntent (manual capture) sized to the agreed rate; release
   funds ~24–48h after the talent marks the booking complete, with a dispute
   window.
5. **Real map.** Swap the `/brand/map` list placeholder for Mapbox GL or
   Google Maps, using PostGIS distance queries against `profiles.lat/lng`.
   **Important:** never expose exact coordinates before a booking is
   confirmed — round/jitter to the nearest km (see the note in schema.sql).
6. **Messaging.** Real-time chat using Supabase Realtime, scoped to a booking.
7. **Reviews.** Only allow a review after `bookings.status = 'completed'`,
   and only once per booking per reviewer (already enforced by a unique
   constraint in the schema).
8. **Reporting/moderation.** Build the report flow (schema already has a
   `reports` table) and a lightweight admin review queue.
9. **Capacitor native build.** Once the web app is stable:
   ```bash
   npm run build && npx cap add ios && npx cap add android
   npx cap sync
   ```
   Then open in Xcode/Android Studio to test on device/simulator.

## Design notes

- All money-related UI should show the *fewest possible decisions* — rate,
  what happens to funds, and when. Ambiguity here is the #1 source of
  marketplace disputes.
- Location privacy is a first-class constraint, not an afterthought — see the
  `lat`/`lng` comments in `schema.sql`.
- The 18+ constraint lives in the database (`must_be_adult` check), not just
  the UI, so it can't be bypassed by calling the API directly.
