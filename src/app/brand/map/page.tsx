import { createClient } from "@/lib/supabase/server";
import { mapTalentProfileRow, type TalentProfileRow } from "@/lib/map-talent-row";
import { mockTalent } from "@/lib/mock-data";
import { MapClient } from "./MapClient";
import type { TalentProfile } from "@/types/domain";

// Sydney CBD — used as the map center whenever we don't have a real
// signed-in brand location to fall back on (logged out, or no lat/lng
// set on their profile yet).
const DEFAULT_CENTER = { lat: -33.8688, lng: 151.2093 };

type NearbyRow = { id: string; distance_km: number; fuzzed_lat: number; fuzzed_lng: number };

export default async function BrandMapPage() {
  const { talent, center } = await loadMapTalent();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? null;
  return <MapClient talent={talent} center={center} mapboxToken={mapboxToken} />;
}

async function loadMapTalent(): Promise<{ talent: TalentProfile[]; center: { lat: number; lng: number } }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let center = DEFAULT_CENTER;
    if (user) {
      const { data: brandProfile } = await supabase
        .from("profiles")
        .select("lat, lng")
        .eq("id", user.id)
        .single();
      if (brandProfile?.lat != null && brandProfile?.lng != null) {
        center = { lat: brandProfile.lat, lng: brandProfile.lng };
      }
    }

    // nearby_talent is a PostGIS RPC (see supabase/migrations/002_nearby_talent.sql)
    // that returns real distance but a fuzzed pin position — see that file
    // for why the fuzzing happens in SQL rather than in the browser.
    const { data: nearby, error: rpcError } = await supabase.rpc("nearby_talent", {
      brand_lat: center.lat,
      brand_lng: center.lng,
      radius_km: 50,
    });

    if (rpcError || !nearby || (nearby as NearbyRow[]).length === 0) {
      return { talent: mockTalent, center };
    }

    const geoById = new Map((nearby as NearbyRow[]).map((n) => [n.id, n]));
    const ids = Array.from(geoById.keys());

    const { data: profileRows, error: profileError } = await supabase
      .from("talent_profiles")
      .select("*, profiles(full_name, city)")
      .in("id", ids)
      .eq("is_available", true)
      .not("tagline", "is", null)
      .neq("tagline", "");

    if (profileError || !profileRows) {
      return { talent: mockTalent, center };
    }

    const talent = (profileRows as unknown as TalentProfileRow[])
      .map(mapTalentProfileRow)
      .map((t) => {
        const geo = geoById.get(t.id);
        if (!geo) return t;
        return {
          ...t,
          lat: geo.fuzzed_lat,
          lng: geo.fuzzed_lng,
          distanceKm: Math.round(geo.distance_km * 10) / 10,
        };
      });

    return talent.length > 0 ? { talent, center } : { talent: mockTalent, center };
  } catch {
    return { talent: mockTalent, center: DEFAULT_CENTER };
  }
}
