"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type BookingRowView = {
  id: string;
  status: string;
  agreedRate: number;
  scheduledAt: string | null;
  gigTitle: string;
  counterpartyId: string;
  counterpartyName: string;
  myReview: { rating: number; comment: string | null } | null;
};

const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  pending_confirmation: { label: "Awaiting confirmation", bg: "var(--blue-tint)", fg: "var(--blue)" },
  confirmed: { label: "Confirmed", bg: "#e3f8e9", fg: "var(--green)" },
  in_progress: { label: "In progress", bg: "var(--blue-tint)", fg: "var(--blue)" },
  completed: { label: "Completed", bg: "var(--fog)", fg: "var(--graphite)" },
  disputed: { label: "Disputed", bg: "var(--red-tint)", fg: "var(--red)" },
  cancelled: { label: "Cancelled", bg: "var(--fog)", fg: "var(--graphite)" },
};

export function BookingsList({
  bookings,
  viewer,
}: {
  bookings: BookingRowView[];
  viewer: "talent" | "brand";
}) {
  const [rows, setRows] = useState(bookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewFormId, setReviewFormId] = useState<string | null>(null);
  const [ratingDraft, setRatingDraft] = useState(5);
  const [commentDraft, setCommentDraft] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  async function updateStatus(id: string, status: string) {
    setError(null);
    setLoadingId(id);

    const supabase = createClient();
    const { error: updateError } = await supabase.from("bookings").update({ status }).eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setLoadingId(null);
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setLoadingId(null);
  }

  async function submitReview(booking: BookingRowView) {
    setError(null);
    setSubmittingReview(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in to leave a review.");
      setSubmittingReview(false);
      return;
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      booking_id: booking.id,
      reviewer_id: user.id,
      reviewee_id: booking.counterpartyId,
      rating: ratingDraft,
      comment: commentDraft || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmittingReview(false);
      return;
    }

    setRows((prev) =>
      prev.map((r) =>
        r.id === booking.id
          ? { ...r, myReview: { rating: ratingDraft, comment: commentDraft || null } }
          : r
      )
    );
    setReviewFormId(null);
    setCommentDraft("");
    setRatingDraft(5);
    setSubmittingReview(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-sm" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}

      {rows.map((b) => {
        const status = STATUS_LABEL[b.status] ?? STATUS_LABEL.pending_confirmation;
        const busy = loadingId === b.id;

        return (
          <div
            key={b.id}
            className="rounded-[16px] p-4"
            style={{ background: "#fff", border: "0.5px solid var(--hairline)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{b.gigTitle}</div>
                <div className="text-xs truncate" style={{ color: "var(--graphite)" }}>
                  {b.counterpartyName}
                </div>
              </div>
              <span
                className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap"
                style={{ background: status.bg, color: status.fg }}
              >
                {status.label}
              </span>
            </div>

            <div className="font-mono text-xs mt-2" style={{ color: "var(--ink)" }}>
              ${b.agreedRate}
            </div>

            {viewer === "talent" && b.status === "pending_confirmation" && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => updateStatus(b.id, "confirmed")}
                  disabled={busy}
                  className="flex-1 text-xs font-semibold py-2 rounded-full text-white disabled:opacity-50"
                  style={{ background: "var(--green)" }}
                >
                  {busy ? "…" : "Confirm"}
                </button>
                <button
                  onClick={() => updateStatus(b.id, "cancelled")}
                  disabled={busy}
                  className="flex-1 text-xs font-semibold py-2 rounded-full disabled:opacity-50"
                  style={{ background: "var(--fog)", color: "var(--ink)" }}
                >
                  {busy ? "…" : "Decline"}
                </button>
              </div>
            )}

            {viewer === "brand" && b.status === "pending_confirmation" && (
              <button
                onClick={() => updateStatus(b.id, "cancelled")}
                disabled={busy}
                className="mt-3 text-xs font-semibold py-2 rounded-full w-full disabled:opacity-50"
                style={{ background: "var(--fog)", color: "var(--ink)" }}
              >
                {busy ? "…" : "Cancel booking"}
              </button>
            )}

            {b.status === "confirmed" && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => updateStatus(b.id, "completed")}
                  disabled={busy}
                  className="flex-1 text-xs font-semibold py-2 rounded-full text-white disabled:opacity-50"
                  style={{ background: "var(--blue)" }}
                >
                  {busy ? "…" : "Mark as completed"}
                </button>
                <button
                  onClick={() => updateStatus(b.id, "cancelled")}
                  disabled={busy}
                  className="text-xs font-semibold py-2 px-4 rounded-full disabled:opacity-50"
                  style={{ background: "var(--fog)", color: "var(--ink)" }}
                >
                  {busy ? "…" : "Cancel"}
                </button>
              </div>
            )}

            {b.status === "completed" && (
              <div className="mt-3">
                {b.myReview ? (
                  <div
                    className="rounded-[12px] p-3 text-xs"
                    style={{ background: "var(--fog)", color: "var(--ink)" }}
                  >
                    <div>
                      You rated this {"★".repeat(b.myReview.rating)}
                      {"☆".repeat(5 - b.myReview.rating)}
                    </div>
                    {b.myReview.comment && (
                      <div className="mt-1" style={{ color: "var(--graphite)" }}>
                        {b.myReview.comment}
                      </div>
                    )}
                  </div>
                ) : reviewFormId === b.id ? (
                  <div className="rounded-[12px] p-3" style={{ background: "var(--fog)" }}>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setRatingDraft(n)}
                          className="text-xl leading-none"
                          style={{ color: n <= ratingDraft ? "var(--blue)" : "var(--hairline)" }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="How did it go? (optional)"
                      rows={2}
                      className="w-full text-xs rounded-[10px] p-2 mb-2"
                      style={{ border: "1px solid var(--hairline)", background: "#fff" }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitReview(b)}
                        disabled={submittingReview}
                        className="flex-1 text-xs font-semibold py-2 rounded-full text-white disabled:opacity-50"
                        style={{ background: "var(--blue)" }}
                      >
                        {submittingReview ? "Submitting…" : "Submit review"}
                      </button>
                      <button
                        onClick={() => setReviewFormId(null)}
                        className="text-xs font-semibold py-2 px-4 rounded-full"
                        style={{ background: "#fff", color: "var(--ink)", border: "1px solid var(--hairline)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setReviewFormId(b.id);
                      setRatingDraft(5);
                      setCommentDraft("");
                    }}
                    className="text-xs font-semibold py-2 rounded-full w-full"
                    style={{ background: "var(--fog)", color: "var(--ink)" }}
                  >
                    Leave a review
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
