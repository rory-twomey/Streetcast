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

    const profiles = (data as unknown as TalentProfileRow[]).map(mapTalentProfileRow);

    // Overlay real rating/review counts from the reviews table — the
    // talent_profiles columns are just a placeholder default of 0.
    const talentIds = profiles.map((p) => p.id);
    if (talentIds.length > 0) {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("reviewee_id, rating")
        .in("reviewee_id", talentIds);

      const statsByTalent = new Map<string, { sum: number; count: number }>();
      for (const r of reviews ?? []) {
        const s = statsByTalent.get(r.reviewee_id) ?? { sum: 0, count: 0 };
        s.sum += r.rating;
        s.count += 1;
        statsByTalent.set(r.reviewee_id, s);
      }

      for (const p of profiles) {
        const s = statsByTalent.get(p.id);
        if (s) {
          p.rating = Math.round((s.sum / s.count) * 10) / 10;
          p.reviewCount = s.count;
        }
      }
    }

    return profiles;
  } catch {
    return mockTalent;
  }
}
