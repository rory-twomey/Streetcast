import { mockGigs } from "@/lib/mock-data";
import { DiscoverGigsClient } from "./DiscoverGigsClient";

// TODO once Supabase is wired up: replace mockGigs with a real query, e.g.
//
//   const supabase = await createClient();
//   const { data: gigs } = await supabase
//     .from("gigs")
//     .select("*")
//     .eq("status", "live");
//
// and map the rows into the `Gig` shape (see src/types/domain.ts).
// Distance would come from a PostGIS query comparing the gig's lat/lng
// to the signed-in talent's stored location.

export default function TalentDiscoverPage() {
  return <DiscoverGigsClient gigs={mockGigs} />;
}
