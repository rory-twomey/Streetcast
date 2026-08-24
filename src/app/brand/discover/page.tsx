import { createClient } from "@/lib/supabase/server";
import { mapTalentProfileRow, type TalentProfileRow } from "@/lib/map-talent-row";
import { mockTalent } from "@/lib/mock-data";
import { DiscoverTalentClient } from "./DiscoverTalentClient";
import type { TalentProfile } from "@/types/domain";

export default async function BrandDiscoverPage() {
  const [talent, isVerified] = await Promise.all([loadTalent(), loadVerificationStatus()]);
  return <DiscoverTalentClient talent={talent} isVerified={isVerified} />;
}

async function loadVerificationStatus(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("profiles")
      .select("id_verification_status")
      .eq("id", user.id)
      .single();

    return data?.id_verification_status === "verified";
  } catch {
    return false;
  }
}

async function loadTalent(): Promise<TalentProfile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("talent_profiles")
      .select("*, profiles(full_name, city)")
      .eq("is_available", true)
      // Only show profiles people have actually filled in — an empty
      // tagline means they haven't set anything up yet.
      .not("tagline", "is", null)
      .neq("tagline", "");

    // If Supabase isn't configured yet (no env vars) or the query fails,
    // fall back to mock data so the app is still demoable.
    if (error || !data) return mockTalent;

    return (data as unknown as TalentProfileRow[]).map(mapTalentProfileRow);
  } catch {
    return mockTalent;
  }
}
