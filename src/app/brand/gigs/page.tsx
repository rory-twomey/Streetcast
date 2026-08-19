// TODO once Supabase is wired up: fetch this brand's gigs with
//   supabase.from("gigs").select("*, bookings(count)").eq("brand_id", user.id)
// and applicant counts from gig_swipes where direction = 'right'.

const mockListings = [
  { title: "Studio Product Shoot", rate: "$180 · 2 hrs", status: "LIVE", applicants: 12 },
  { title: "Pop-Up Brand Ambassador", rate: "$35/hr · 4 hrs", status: "3 DAYS LEFT", applicants: 7 },
  { title: "Instagram Reel Campaign", rate: "$90 · per reel", status: "FILLED", applicants: 0, filled: true },
];

export default function BrandGigsPage() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6 flex flex-col gap-3">
      <div>
        <div className="text-lg font-bold tracking-tight">Your gigs</div>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          People swipe, you pick who&apos;s cast. No agency fees.
        </p>
      </div>

      {mockListings.map((gig) => (
        <div
          key={gig.title}
          className="rounded-[18px] p-4 shrink-0"
          style={{
            background: "#fff",
            border: "0.5px solid var(--hairline)",
            boxShadow: "0 4px 14px rgba(0,0,0,.04)",
            opacity: gig.filled ? 0.55 : 1,
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-base">{gig.title}</h3>
              <div className="font-mono text-xs mt-1" style={{ color: "var(--ink)" }}>
                {gig.rate}
              </div>
            </div>
            <span
              className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
              style={{
                background: gig.status === "LIVE" ? "#e3f8e9" : gig.filled ? "var(--fog)" : "var(--blue-tint)",
                color: gig.status === "LIVE" ? "var(--green)" : gig.filled ? "var(--graphite)" : "var(--blue)",
              }}
            >
              {gig.status}
            </span>
          </div>
          <div className="flex items-center gap-2.5 mt-3">
            <span className="text-xs font-medium" style={{ color: "var(--graphite)" }}>
              {gig.filled ? "Streetcast: @maya_reels" : `${gig.applicants} people are in`}
            </span>
          </div>
        </div>
      ))}

      <button
        className="mt-1 rounded-[14px] py-3.5 font-semibold text-sm text-white"
        style={{ background: "var(--blue)" }}
      >
        + Post a new gig
      </button>
    </div>
  );
}
