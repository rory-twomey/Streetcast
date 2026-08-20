import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type GigRow = {
  id: string;
  title: string;
  rate: number;
  rate_unit: string;
  status: string;
};

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  live: { bg: "#e3f8e9", fg: "var(--green)", label: "LIVE" },
  filled: { bg: "var(--fog)", fg: "var(--graphite)", label: "FILLED" },
  draft: { bg: "var(--blue-tint)", fg: "var(--blue)", label: "DRAFT" },
  closed: { bg: "var(--fog)", fg: "var(--graphite)", label: "CLOSED" },
  cancelled: { bg: "var(--fog)", fg: "var(--graphite)", label: "CANCELLED" },
};

const RATE_UNIT_LABEL: Record<string, string> = {
  hr: "/hr",
  flat: " flat",
  half_day: " half day",
  day: "/day",
};

export default async function BrandGigsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div>
          <div className="text-lg font-bold mb-2">Log in to see your gigs</div>
          <Link href="/login" className="text-sm underline" style={{ color: "var(--blue)" }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const { data: gigs } = await supabase
    .from("gigs")
    .select("id, title, rate, rate_unit, status")
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false });

  const gigRows = (gigs ?? []) as GigRow[];
  const gigIds = gigRows.map((g) => g.id);

  let applicantCounts: Record<string, number> = {};
  if (gigIds.length > 0) {
    const { data: swipes } = await supabase
      .from("gig_swipes")
      .select("gig_id")
      .in("gig_id", gigIds)
      .eq("direction", "right");

    applicantCounts = (swipes ?? []).reduce((acc: Record<string, number>, s: { gig_id: string }) => {
      acc[s.gig_id] = (acc[s.gig_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6 flex flex-col gap-3">
      <div>
        <div className="text-lg font-bold tracking-tight">Your gigs</div>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          People swipe, you pick who&apos;s cast. No agency fees.
        </p>
      </div>

      {gigRows.length === 0 && (
        <div
          className="rounded-[18px] p-5 text-sm"
          style={{ background: "var(--fog)", color: "var(--graphite)" }}
        >
          You haven&apos;t posted a gig yet. Once you do, it shows up here and in the swipe
          deck for nearby talent.
        </div>
      )}

      {gigRows.map((gig) => {
        const style = STATUS_STYLE[gig.status] ?? STATUS_STYLE.live;
        return (
          <div
            key={gig.id}
            className="rounded-[18px] p-4 shrink-0"
            style={{
              background: "#fff",
              border: "0.5px solid var(--hairline)",
              boxShadow: "0 4px 14px rgba(0,0,0,.04)",
              opacity: gig.status === "filled" || gig.status === "closed" ? 0.6 : 1,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base">{gig.title}</h3>
                <div className="font-mono text-xs mt-1" style={{ color: "var(--ink)" }}>
                  ${gig.rate}
                  {RATE_UNIT_LABEL[gig.rate_unit] ?? ""}
                </div>
              </div>
              <span
                className="text-[10.5px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{ background: style.bg, color: style.fg }}
              >
                {style.label}
              </span>
            </div>
            <div className="flex items-center gap-2.5 mt-3">
              <span className="text-xs font-medium" style={{ color: "var(--graphite)" }}>
                {applicantCounts[gig.id] ?? 0} people are in
              </span>
            </div>
          </div>
        );
      })}

      <Link
        href="/brand/gigs/new"
        className="mt-1 rounded-[14px] py-3.5 font-semibold text-sm text-white text-center"
        style={{ background: "var(--blue)" }}
      >
        + Post a new gig
      </Link>
    </div>
  );
}
