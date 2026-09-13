-- Escrow payments: adds Stripe Connect fields for talent payouts, and
-- payment-state tracking on bookings, separate from the booking's own
-- status (a booking can be "confirmed" while payment is still unpaid,
-- held, or released — these are independent state machines).

create type payment_status as enum ('unpaid', 'held', 'released', 'failed');

alter table public.talent_profiles
  add column if not exists stripe_connect_account_id text,
  add column if not exists stripe_connect_onboarded boolean not null default false;

alter table public.bookings
  add column if not exists payment_status payment_status not null default 'unpaid',
  add column if not exists stripe_checkout_session_id text,
  -- All three *_cents columns are snapshotted at checkout time from the
  -- fee split in src/lib/fees.ts, rather than recomputed later, so a
  -- future change to the platform's take rate never rewrites the amount
  -- for a booking that's already been charged.
  add column if not exists brand_charge_cents integer,
  add column if not exists platform_fee_cents integer,
  add column if not exists talent_payout_cents integer;
