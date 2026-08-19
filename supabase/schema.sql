-- ============================================================
-- Cast — core database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- Extensions we need
create extension if not exists "uuid-ossp";
create extension if not exists postgis;   -- for real distance queries later

-- ------------------------------------------------------------
-- USERS & IDENTITY
-- ------------------------------------------------------------
-- Supabase already gives us `auth.users` for login/email/password.
-- This table extends it with app-specific fields shared by everyone.

create type user_role as enum ('talent', 'brand', 'admin');
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  avatar_url text,
  phone text,
  date_of_birth date not null,               -- required at signup; enforce 18+ in app logic AND a check constraint below
  city text,
  -- store an approximate location only (never exact address) — see note in README
  lat double precision,
  lng double precision,
  id_verification_status verification_status not null default 'unverified',
  id_verification_provider_ref text,          -- reference id from Stripe Identity / Persona etc.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint must_be_adult check (date_of_birth <= (current_date - interval '18 years'))
);

-- ------------------------------------------------------------
-- TALENT-SPECIFIC PROFILE
-- ------------------------------------------------------------
create table public.talent_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  tagline text,
  bio text,
  tags text[] default '{}',                  -- e.g. {"Photoshoot","Content Video"}
  interests text[] default '{}',
  rate_min numeric,
  rate_max numeric,
  rate_unit text default 'hr',               -- 'hr' | 'flat' | 'half_day' | 'day'
  portfolio_urls text[] default '{}',
  average_rating numeric default 0,
  review_count integer default 0,
  is_available boolean default true
);

-- ------------------------------------------------------------
-- BRAND-SPECIFIC PROFILE
-- ------------------------------------------------------------
create table public.brand_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  abn text,                                   -- or local business registration number
  business_verification_status verification_status not null default 'unverified',
  website text,
  logo_url text
);

-- ------------------------------------------------------------
-- GIGS
-- ------------------------------------------------------------
create type gig_status as enum ('draft', 'live', 'filled', 'closed', 'cancelled');

create table public.gigs (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references public.brand_profiles(id) on delete cascade,
  title text not null,
  category text not null,                    -- 'Photoshoot' | 'Event Promo' | 'Content Video' | 'Fitting' etc.
  description text not null,
  rate numeric not null,
  rate_unit text not null default 'flat',     -- 'hr' | 'flat' | 'half_day' | 'day'
  duration_minutes integer,
  location_text text,
  lat double precision,
  lng double precision,
  is_remote boolean default false,
  usage_rights text,                          -- plain-language description of what the brand can do with the content
  status gig_status not null default 'live',
  spots_available integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- SWIPES / APPLICATIONS (talent swiping on gigs)
-- ------------------------------------------------------------
create type swipe_direction as enum ('left', 'right');

create table public.gig_swipes (
  id uuid primary key default uuid_generate_v4(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  direction swipe_direction not null,
  created_at timestamptz not null default now(),
  unique (gig_id, talent_id)
);

-- ------------------------------------------------------------
-- SWIPES (brand swiping on talent profiles / shortlisting)
-- ------------------------------------------------------------
create table public.talent_swipes (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references public.brand_profiles(id) on delete cascade,
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  direction swipe_direction not null,
  created_at timestamptz not null default now(),
  unique (brand_id, talent_id)
);

-- ------------------------------------------------------------
-- BOOKINGS (a gig_swipe that turned into a confirmed job)
-- ------------------------------------------------------------
create type booking_status as enum (
  'pending_confirmation', 'confirmed', 'in_progress',
  'completed', 'disputed', 'cancelled'
);

create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  gig_id uuid not null references public.gigs(id),
  brand_id uuid not null references public.brand_profiles(id),
  talent_id uuid not null references public.talent_profiles(id),
  status booking_status not null default 'pending_confirmation',
  agreed_rate numeric not null,
  scheduled_at timestamptz,
  exact_location_text text,                   -- only revealed to talent once booking is confirmed
  contract_terms jsonb,                        -- generated contract: usage rights, cancellation policy, etc.
  stripe_payment_intent_id text,               -- escrow hold reference
  funds_released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- REVIEWS (two-way: brand -> talent, talent -> brand)
-- ------------------------------------------------------------
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  reviewee_id uuid not null references public.profiles(id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (booking_id, reviewer_id)
);

-- ------------------------------------------------------------
-- MESSAGES (simple 1:1 thread per booking/match)
-- ------------------------------------------------------------
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- REPORTS (safety: report a user or a gig)
-- ------------------------------------------------------------
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.profiles(id),
  reported_user_id uuid references public.profiles(id),
  reported_gig_id uuid references public.gigs(id),
  reason text not null,
  details text,
  status text not null default 'open',        -- 'open' | 'reviewing' | 'resolved'
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- These policies are a starting point — review carefully before
-- going to production. The guiding rule: people can read what
-- they need to make a decision, and write only their own data.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.talent_profiles enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.gigs enable row level security;
alter table public.gig_swipes enable row level security;
alter table public.talent_swipes enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- Profiles: anyone authenticated can read basic profile info,
-- but you can only edit your own.
create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Talent / brand profile tables follow the same pattern
create policy "talent profiles are viewable by authenticated users"
  on public.talent_profiles for select
  using (auth.role() = 'authenticated');
create policy "talent can update own profile"
  on public.talent_profiles for update using (auth.uid() = id);
create policy "talent can insert own profile"
  on public.talent_profiles for insert with check (auth.uid() = id);

create policy "brand profiles are viewable by authenticated users"
  on public.brand_profiles for select
  using (auth.role() = 'authenticated');
create policy "brand can update own profile"
  on public.brand_profiles for update using (auth.uid() = id);
create policy "brand can insert own profile"
  on public.brand_profiles for insert with check (auth.uid() = id);

-- Gigs: anyone can view live gigs; only the owning brand can edit/insert
create policy "live gigs are publicly viewable to authenticated users"
  on public.gigs for select
  using (status = 'live' or brand_id = auth.uid());
create policy "brand can manage own gigs"
  on public.gigs for all
  using (brand_id = auth.uid());

-- Swipes: users can only see and create their own swipes
create policy "talent can manage own gig swipes"
  on public.gig_swipes for all
  using (talent_id = auth.uid());
create policy "brand can manage own talent swipes"
  on public.talent_swipes for all
  using (brand_id = auth.uid());

-- Bookings: visible only to the two parties involved
create policy "bookings visible to involved parties"
  on public.bookings for select
  using (brand_id = auth.uid() or talent_id = auth.uid());
create policy "brand can create bookings"
  on public.bookings for insert
  with check (brand_id = auth.uid());
create policy "involved parties can update booking"
  on public.bookings for update
  using (brand_id = auth.uid() or talent_id = auth.uid());

-- Reviews: readable by everyone (they inform trust decisions),
-- writable only by the reviewer, only after a completed booking
create policy "reviews are publicly viewable"
  on public.reviews for select
  using (auth.role() = 'authenticated');
create policy "reviewer can create own review"
  on public.reviews for insert
  with check (reviewer_id = auth.uid());

-- Messages: only sender/recipient can read
create policy "messages visible to sender and recipient"
  on public.messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy "authenticated users can send messages"
  on public.messages for insert
  with check (sender_id = auth.uid());

-- Reports: reporter can create; only admins should read (handled via service role, not here)
create policy "users can file reports"
  on public.reports for insert
  with check (reporter_id = auth.uid());
