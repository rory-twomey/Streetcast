import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ApplicantsClient } from "./ApplicantsClient";

const RATE_UNIT_SUFFIX: Record<string, string> = {
  hr: "/hr",
  flat: " flat",
  half_day: "/half day",
  day: "/day",
};

type SwipeRow = {
  talent_id: string;
  talent_profiles:
    | { tagline: string | null; profiles: { full_name: string } | { full_name: string }[] | null }
    | { tagline: string | null; profiles: { full_name: string } | { full_name: string }[] | null }[]
    | null;
};

export default async function GigApplicantsPage({
  params,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const { gigId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div>
          <div className="text-lg font-bold mb-2">Log in to see this gig</div>
          <Link href="/login" className="text-sm underline" style={{ color: "var(--blue)" }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, title, rate, rate_unit, status")
    .eq("id", gigId)
    .eq("brand_id", user.id)
    .single();

  if (!gig) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div>
          <div className="text-lg font-bold mb-2">Gig not found</div>
          <Link href="/brand/gigs" className="text-sm underline" style={{ color: "var(--blue)" }}>
            Back to your gigs
          </Link>
        </div>
      </div>
    );
  }

  const { data: swipes } = await supabase
    .from("gig_swipes")
    .select("talent_id, talent_profiles(tagline, profiles(full_name))")
    .eq("gig_id", gigId)
    .eq("direction", "right");

  const { data: bookings } = await supabase.from("bookings").select("talent_id, status").eq("gig_id", gigId);

  const bookingByTalent = new Map((bookings ?? []).map((b) => [b.talent_id, b.status]));

  const applicants = ((swipes ?? []) as SwipeRow[]).map((s) => {
    const tp = Array.isArray(s.talent_profiles) ? s.talent_profiles[0] : s.talent_profiles;
    const profile = tp ? (Array.isArray(tp.profiles) ? tp.profiles[0] : tp.profiles) : null;
    return {
      talentId: s.talent_id,
      name: profile?.full_name ?? "Streetcast member",
      tagline: tp?.tagline ?? "",
      bookingStatus: bookingByTalent.get(s.talent_id) ?? null,
    };
  });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-8">
      <Link href="/brand/gigs" className="text-sm mb-3 inline-block" style={{ color: "var(--blue)" }}>
        ← Your gigs
      </Link>
      <div className="text-lg font-bold tracking-tight mb-1">{gig.title}</div>
      <p className="text-sm mb-5" style={{ color: "var(--graphite)" }}>
        People who applied. Confirming sends a booking offer at ${gig.rate}
        {RATE_UNIT_SUFFIX[gig.rate_unit] ?? ""} for them to accept.
      </p>
      <ApplicantsClient gigId={gig.id} brandId={user.id} defaultRate={gig.rate} applicants={applicants} />
    </div>
  );
}
