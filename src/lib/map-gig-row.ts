import type { Gig } from "@/types/domain";

const RATE_UNIT_FALLBACK_LABEL: Record<string, string> = {
  hr: "Per hour",
  flat: "One-off",
  half_day: "Half day",
  day: "Full day",
};

function formatDuration(durationMinutes: number | null, rateUnit: string): string {
  if (durationMinutes) {
    if (durationMinutes < 60) return `${durationMinutes} min`;
    const hrs = durationMinutes / 60;
    return `${hrs % 1 === 0 ? hrs : hrs.toFixed(1)} hrs`;
  }
  return RATE_UNIT_FALLBACK_LABEL[rateUnit] ?? "";
}

/**
 * Raw shape of a row from `gigs`, joined with the owning brand's name.
 * Kept loose (not the generated Database type) since that's still a
 * placeholder — see src/types/database.types.ts.
 */
type GigRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  rate: number;
  rate_unit: string;
  duration_minutes: number | null;
  location_text: string | null;
  is_remote: boolean;
  brand_profiles: { company_name: string } | { company_name: string }[] | null;
};

export function mapGigRow(row: GigRow): Gig {
  const brand = Array.isArray(row.brand_profiles) ? row.brand_profiles[0] : row.brand_profiles;

  return {
    id: row.id,
    title: row.title,
    brandName: brand?.company_name ?? "A Streetcast brand",
    category: row.category,
    description: row.description,
    rate: row.rate,
    rateUnit: (row.rate_unit as Gig["rateUnit"]) ?? "flat",
    durationLabel: formatDuration(row.duration_minutes, row.rate_unit),
    locationText: row.location_text ?? (row.is_remote ? "Remote" : "Location TBC"),
    distanceKm: null, // no geo distance calc yet — see README "Real map" step
    isRemote: row.is_remote,
  };
}
