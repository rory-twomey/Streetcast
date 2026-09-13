"use client";

import { useState } from "react";

export function StartPayoutSetupButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "Couldn't start payout setup. Try again in a moment.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Couldn't reach Stripe. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-full px-6 py-3.5 font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--blue)" }}
      >
        {loading ? "Starting…" : "Set up payouts"}
      </button>
      {error && (
        <p className="text-sm mt-3" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
