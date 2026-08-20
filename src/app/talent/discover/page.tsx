import { createClient } from "@/lib/supabase/server";
import { mapGigRow } from "@/lib/map-gig-row";
import { mockGigs } from "@/lib/mock-data";
import { DiscoverGigsClient } from "./DiscoverGigsClient";
import type { Gig } from "@/types/domain";

export default async function TalentDiscoverPage() {
  const gigs = await loadLiveGigs();
  return <DiscoverGigsClient gigs={gigs} />;
}

async function loadLiveGigs(): Promise<Gig[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gigs")
      .select("*, brand_profiles(company_name)")
      .eq("status", "live")
      .order("created_at", { ascending: false });

    // If Supabase isn't configured yet (no env vars) or the query fails,
    // fall back to mock data so the app is still demoable.
    if (error || !data) return mockGigs;

    return data.map(mapGigRow);
  } catch {
    return mockGigs;
  }
}
