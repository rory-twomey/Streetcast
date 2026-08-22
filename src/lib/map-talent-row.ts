import type { TalentProfile } from "@/types/domain";

const RATE_UNIT_SUFFIX: Record<string, string> = {
  hr: "/hr",
  flat: " flat",
  half_day: "/half day",
  day: "/day",
};

function initialsFrom(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function rateRangeLabel(min: number | null, max: number | null, unit: string): string {
  const suffix = RATE_UNIT_SUFFIX[unit] ?? "";
  if (min && max && min !== max) return `$${min}–${max}${suffix}`;
  if (min || max) return `$${min ?? max}${suffix}`;
  return "Rate on request";
}

/**
 * Raw shape of a row from `talent_profiles`, joined with the owning
 * person's name/city from `profiles`. Kept loose (not the generated
 * Database type) since that's still a placeholder — see
 * src/types/database.types.ts.
 */
export type TalentProfileRow = {
  id: string;
  tagline: string | null;
  bio: string | null;
  tags: string[] | null;
  interests: string[] | null;
  rate_min: number | null;
  rate_max: number | null;
  rate_unit: string | null;
  average_rating: number | null;
  review_count: number | null;
  profiles: { full_name: string; city: string | null } | { full_name: string; city: string | null }[] | null;
};

export function mapTalentProfileRow(row: TalentProfileRow): TalentProfile {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const fullName = profile?.full_name ?? "Streetcast member";

  return {
    id: row.id,
    name: fullName,
    initials: initialsFrom(fullName),
    tagline: row.tagline ?? "",
    bio: row.bio ?? "No bio yet.",
    tags: row.tags ?? [],
    interests: row.interests ?? [],
    locationText: profile?.city ?? "Location TBC",
    distanceKm: null, // no geo distance calc yet — see README "Real map" step
    lat: 0,
    lng: 0,
    rateRangeLabel: rateRangeLabel(row.rate_min, row.rate_max, row.rate_unit ?? "hr"),
    rating: row.average_rating ?? 0,
    reviewCount: row.review_count ?? 0,
    // Booking + review flow isn't built yet (see README "Next steps"),
    // so every real profile starts with an honest empty history rather
    // than fabricated data.
    pastJobs: [],
    reviews: [],
  };
}
