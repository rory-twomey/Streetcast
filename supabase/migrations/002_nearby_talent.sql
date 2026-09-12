-- Real map support: given a brand's location, return nearby available
-- talent with an honest distance figure but a *fuzzed* pin position.
--
-- Why fuzz on the database side rather than in the client: if we sent the
-- real lat/lng to the browser and jittered it in JS, the real coordinates
-- would still have travelled over the wire and would sit in a network
-- request anyone could inspect. Doing it in SQL means the exact address
-- never leaves the database until a booking is confirmed (see
-- bookings.exact_location_text in schema.sql).
--
-- The jitter is a deterministic offset (seeded by the talent's id) up to
-- 1km in a random bearing, so a given person's pin stays in the same spot
-- across page loads instead of jumping around, but still never lands on
-- their real address.
--
-- Run this once in the Supabase SQL editor after schema.sql.

create or replace function nearby_talent(
  brand_lat double precision,
  brand_lng double precision,
  radius_km double precision default 50
)
returns table (
  id uuid,
  distance_km double precision,
  fuzzed_lat double precision,
  fuzzed_lng double precision
)
language sql
stable
as $$
  with base as (
    select
      tp.id,
      p.lat,
      p.lng,
      geography(st_makepoint(p.lng, p.lat)) as geog,
      -- Deterministic pseudo-random jitter distance (0-1000m) and bearing
      -- (0-360deg), both seeded off the talent's own id.
      (abs(hashtext(tp.id::text)) % 1000)::double precision as jitter_m,
      radians((abs(hashtext(tp.id::text || ':bearing')) % 360)::double precision) as jitter_bearing
    from talent_profiles tp
    join profiles p on p.id = tp.id
    where tp.is_available = true
      and p.lat is not null
      and p.lng is not null
  ),
  fuzzed as (
    select
      base.id,
      st_distance(base.geog, geography(st_makepoint(brand_lng, brand_lat))) / 1000.0 as distance_km,
      st_project(base.geog, base.jitter_m, base.jitter_bearing)::geometry as fuzzed_point
    from base
    where st_dwithin(base.geog, geography(st_makepoint(brand_lng, brand_lat)), radius_km * 1000)
  )
  select
    id,
    distance_km,
    st_y(fuzzed_point) as fuzzed_lat,
    st_x(fuzzed_point) as fuzzed_lng
  from fuzzed
  order by distance_km asc;
$$;
