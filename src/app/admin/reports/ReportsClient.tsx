"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ReportRowView = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporterName: string;
  reportedName: string | null;
  reportedGigTitle: string | null;
};

const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  open: { label: "Open", bg: "var(--red-tint)", fg: "var(--red)" },
  reviewing: { label: "Reviewing", bg: "var(--blue-tint)", fg: "var(--blue)" },
  resolved: { label: "Resolved", bg: "var(--fog)", fg: "var(--graphite)" },
};

export function ReportsClient({ reports }: { reports: ReportRowView[] }) {
  const [rows, setRows] = useState(reports);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setError(null);
    setLoadingId(id);

    const supabase = createClient();
    const { error: updateError } = await supabase.from("reports").update({ status }).eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setLoadingId(null);
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setLoadingId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-sm" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
      {rows.map((r) => {
        const status = STATUS_LABEL[r.status] ?? STATUS_LABEL.open;
        const busy = loadingId === r.id;
        return (
          <div
            key={r.id}
            className="rounded-[16px] p-4"
            style={{ background: "#fff", border: "0.5px solid var(--hairline)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="min-w-0">
                <div className="font-bold text-sm">{r.reason}</div>
                <div className="text-xs" style={{ color: "var(--graphite)" }}>
                  Reported by {r.reporterName}
                  {r.reportedName && <> — about {r.reportedName}</>}
                  {r.reportedGigTitle && <> — gig &quot;{r.reportedGigTitle}&quot;</>}
                </div>
              </div>
              <span
                className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap"
                style={{ background: status.bg, color: status.fg }}
              >
                {status.label}
              </span>
            </div>

            {r.details && (
              <p className="text-sm mt-1.5" style={{ color: "var(--ink)" }}>
                {r.details}
              </p>
            )}

            <div className="text-xs mt-2" style={{ color: "var(--graphite)" }}>
              {new Date(r.createdAt).toLocaleString()}
            </div>

            <div className="flex gap-2 mt-3">
              {r.status !== "reviewing" && (
                <button
                  onClick={() => updateStatus(r.id, "reviewing")}
                  disabled={busy}
                  className="flex-1 text-xs font-semibold py-2 rounded-full disabled:opacity-50"
                  style={{ background: "var(--blue-tint)", color: "var(--blue)" }}
                >
                  {busy ? "…" : "Mark reviewing"}
                </button>
              )}
              {r.status !== "resolved" && (
                <button
                  onClick={() => updateStatus(r.id, "resolved")}
                  disabled={busy}
                  className="flex-1 text-xs font-semibold py-2 rounded-full disabled:opacity-50"
                  style={{ background: "var(--fog)", color: "var(--ink)" }}
                >
                  {busy ? "…" : "Mark resolved"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
