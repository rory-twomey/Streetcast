import { mockTalent } from "@/lib/mock-data";
import { DiscoverTalentClient } from "./DiscoverTalentClient";

// TODO once Supabase is wired up: query talent_profiles joined with profiles,
// filtered/sorted by distance from the brand's stored location using PostGIS.

export default function BrandDiscoverPage() {
  return <DiscoverTalentClient talent={mockTalent} />;
}
