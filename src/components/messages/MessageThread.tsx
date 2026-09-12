"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ThreadMessage } from "@/lib/messaging";

const REPORT_REASONS = [
  "Inappropriate behavior",
  "Scam or fraud",
  "Fake or misleading profile",
  "No-show for a booking",
  "Other",
];

export function MessageThread({
  currentUserId,
  partnerId,
  partnerName,
  backHref,
  initialMessages,
}: {
  currentUserId: string;
  partnerId: string;
  partnerName: string;
  backHref: string;
  initialMessages: ThreadMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reported, setReported] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    setDraft("");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({ sender_id: currentUserId, recipient_id: partnerId, body })
      .select("id, sender_id, body, created_at")
      .single();

    if (!error && data) {
      const row = data as { id: string; sender_id: string; body: string; created_at: string };
      setMessages((prev) => [
        ...prev,
        { id: row.id, senderId: row.sender_id, body: row.body, createdAt: row.created_at },
      ]);
    } else if (error) {
      console.error("Couldn't send message:", error.message);
    }
    setSending(false);
  }

  async function submitReport() {
    setReportError(null);
    setSubmittingReport(true);

    const supabase = createClient();
    const { error } = await supabase.from("reports").insert({
      reporter_id: currentUserId,
      reported_user_id: partnerId,
      reason: reportReason,
      details: reportDetails || null,
    });

    if (error) {
      setReportError(error.message);
      setSubmittingReport(false);
      return;
    }

    setReported(true);
    setShowReportForm(false);
    setSubmittingReport(false);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "0.5px solid var(--hairline)" }}
      >
        <Link href={backHref} className="flex items-center justify-center w-8 h-8 -ml-1.5">
          <ChevronLeft size={20} />
        </Link>
        <span className="font-bold text-base flex-1">{partnerName}</span>
        {!reported ? (
          <button
            onClick={() => setShowReportForm((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full"
            style={{ background: "var(--fog)", color: "var(--graphite)" }}
          >
            <Flag size={12} />
            Report
          </button>
        ) : (
          <span
            className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap"
            style={{ background: "var(--fog)", color: "var(--graphite)" }}
          >
            Reported
          </span>
        )}
      </div>

      {showReportForm && (
        <div
          className="px-4 py-3 flex flex-col gap-2"
          style={{ background: "var(--fog)", borderBottom: "0.5px solid var(--hairline)" }}
        >
          {reportError && (
            <p className="text-xs" style={{ color: "var(--red)" }}>
              {reportError}
            </p>
          )}
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="text-sm rounded-[10px] px-3 py-2"
            style={{ border: "1px solid var(--hairline)", background: "#fff" }}
          >
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="Anything else we should know? (optional)"
            rows={2}
            className="text-sm rounded-[10px] px-3 py-2"
            style={{ border: "1px solid var(--hairline)", background: "#fff" }}
          />
          <div className="flex gap-2">
            <button
              onClick={submitReport}
              disabled={submittingReport}
              className="flex-1 text-xs font-semibold py-2 rounded-full text-white disabled:opacity-50"
              style={{ background: "var(--red)" }}
            >
              {submittingReport ? "Submitting…" : "Submit report"}
            </button>
            <button
              onClick={() => setShowReportForm(false)}
              className="text-xs font-semibold py-2 px-4 rounded-full"
              style={{ background: "#fff", color: "var(--ink)", border: "1px solid var(--hairline)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {messages.length === 0 && (
          <p className="text-sm text-center mt-8" style={{ color: "var(--graphite)" }}>
            Say hello — this is the start of your conversation.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className="max-w-[75%] rounded-[16px] px-3.5 py-2.5 text-sm"
              style={
                mine
                  ? { alignSelf: "flex-end", background: "var(--blue)", color: "#fff" }
                  : { alignSelf: "flex-start", background: "var(--fog)", color: "var(--ink)" }
              }
            >
              {m.body}
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderTop: "0.5px solid var(--hairline)" }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message..."
          className="flex-1 rounded-full px-4 py-2.5 text-sm"
          style={{ border: "1px solid var(--hairline)" }}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          style={{ background: "var(--blue)", color: "#fff" }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
