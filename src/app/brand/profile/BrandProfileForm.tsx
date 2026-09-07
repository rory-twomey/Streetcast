"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type BrandProfileValues = {
  company_name: string;
  abn: string;
  website: string;
};

export function BrandProfileForm({
  userId,
  status,
  initial,
}: {
  userId: string;
  status: string;
  initial: BrandProfileValues;
}) {
  const [companyName, setCompanyName] = useState(initial.company_name);
  const [abn, setAbn] = useState(initial.abn);
  const [website, setWebsite] = useState(initial.website);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(status);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("brand_profiles")
      .update({
        company_name: companyName,
        abn: abn || null,
        website: website || null,
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
  }

  async function handleSubmitForVerification() {
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("brand_profiles")
      .update({ business_verification_status: "pending" })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    setCurrentStatus("pending");
    setSubmitting(false);
  }

  const canSubmitForVerification = currentStatus === "unverified" || currentStatus === "rejected";

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Field label="Company name">
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="ABN / business registration number">
          <input
            value={abn}
            onChange={(e) => setAbn(e.target.value)}
            placeholder="e.g. 12 345 678 901"
            className="input"
          />
        </Field>

        <Field label="Website">
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
            className="input"
          />
        </Field>

        {error && (
          <p className="text-sm" style={{ color: "var(--red)" }}>
            {error}
          </p>
        )}
        {saved && (
          <p className="text-sm" style={{ color: "var(--green)" }}>
            Saved.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full px-6 py-3.5 font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--blue)" }}
        >
          {saving ? "Saving…" : "Save details"}
        </button>
      </form>

      <div
        className="rounded-[16px] p-4"
        style={{ background: "var(--fog)" }}
      >
        {currentStatus === "verified" && (
          <p className="text-sm" style={{ color: "var(--ink)" }}>
            Your business is verified. Talent will see a verified badge on your gigs.
          </p>
        )}
        {currentStatus === "pending" && (
          <p className="text-sm" style={{ color: "var(--ink)" }}>
            Your business details are under review. This usually takes 1–2 business days.
          </p>
        )}
        {canSubmitForVerification && (
          <>
            <p className="text-sm mb-3" style={{ color: "var(--ink)" }}>
              {currentStatus === "rejected"
                ? "Your last submission wasn't approved. Update your details above and resubmit."
                : "Add your ABN or business registration number above, then submit for a manual review."}
            </p>
            <button
              onClick={handleSubmitForVerification}
              disabled={submitting || !abn}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "var(--ink)" }}
            >
              {submitting ? "Submitting…" : "Submit for verification"}
            </button>
            {!abn && (
              <p className="text-xs mt-2" style={{ color: "var(--graphite)" }}>
                Add an ABN above first (and save) before submitting.
              </p>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        .input {
          border: 1px solid var(--hairline);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          width: 100%;
          background: white;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
