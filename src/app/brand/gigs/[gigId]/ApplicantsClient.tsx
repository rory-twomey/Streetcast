"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Applicant = {
  talentId: string;
  name: string;
  tagline: string;
  bookingStatus: string | null;
};

export function ApplicantsClient({
  gigId,
  brandId,
  defaultRate,
  applicants,
}: {
  gigId: string;
  brandId: string;
  defaultRate: number;
  applicants: Applicant[];
}) {
  const [rows, setRows] = useState(applicants);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function confirmBooking(talentId: string) {
    setError(null);
    setLoadingId(talentId);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("bookings").insert({
      gig_id: gigId,
      brand_id: brandId,
      talent_id: talentId,
      agreed_rate: defaultRate,
      status: "pending_confirmation",
    });

    if (insertError) {
      setError(insertError.message);
      setLoadingId(null);
      return;
    }

    setRows((prev) =>
      prev.map((r) => (r.talentId === talentId ? { ...r, bookingStatus: "pending_confirmation" } : r))
    );
    setLoadingId(null);
  }

  if (rows.length === 0) {
    return (
      <div
        className="rounded-[16px] p-5 text-sm"
        style={{ background: "var(--fog)", color: "var(--graphite)" }}
      >
        No one has applied yet. Applicants show up here as talent swipe right on this gig.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-sm" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}

      {rows.map((a) => (
        <div
          key={a.talentId}
          className="rounded-[16px] p-4 flex items-center justify-between gap-3"
          style={{ background: "#fff", border: "0.5px solid var(--hairline)" }}
        >
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">{a.name}</div>
            {a.tagline && (
              <div className="text-xs truncate" style={{ color: "var(--graphite)" }}>
                {a.tagline}
              </div>
            )}
          </div>

          {a.bookingStatus ? (
            <span
              className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap"
              style={{ background: "var(--blue-tint)", color: "var(--blue)" }}
            >
              Booking sent
            </span>
          ) : (
            <button
              onClick={() => confirmBooking(a.talentId)}
              disabled={loadingId === a.talentId}
              className="text-xs font-semibold px-4 py-2 rounded-full text-white whitespace-nowrap disabled:opacity-50"
              style={{ background: "var(--blue)" }}
            >
              {loadingId === a.talentId ? "Sending…" : "Confirm booking"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
