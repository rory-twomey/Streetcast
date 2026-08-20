"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["Photoshoot", "Event Promo", "Content Video", "Fitting", "Other"];
const RATE_UNITS: { value: string; label: string }[] = [
  { value: "hr", label: "Per hour" },
  { value: "flat", label: "Flat rate" },
  { value: "half_day", label: "Half day" },
  { value: "day", label: "Full day" },
];

export default function NewGigPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState("");
  const [rateUnit, setRateUnit] = useState("flat");
  const [isRemote, setIsRemote] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [usageRights, setUsageRights] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const rateNumber = Number(rate);
    if (!rateNumber || rateNumber <= 0) {
      setError("Enter a rate greater than $0.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be logged in to post a gig.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("gigs").insert({
      brand_id: user.id,
      title,
      category,
      description,
      rate: rateNumber,
      rate_unit: rateUnit,
      is_remote: isRemote,
      location_text: isRemote ? null : locationText || null,
      usage_rights: usageRights || null,
      status: "live",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/brand/gigs");
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-8">
      <div className="mb-5">
        <div className="text-lg font-bold tracking-tight">Post a gig</div>
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          This goes straight into the swipe deck for nearby talent.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Title">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Studio Product Shoot"
            className="input"
          />
        </Field>

        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description">
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will they actually be doing? Include anything they should know before applying."
            rows={4}
            className="input resize-none"
          />
        </Field>

        <div className="flex gap-3">
          <Field label="Rate ($)">
            <input
              required
              type="number"
              min="1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="180"
              className="input"
            />
          </Field>
          <Field label="Per">
            <select value={rateUnit} onChange={(e) => setRateUnit(e.target.value)} className="input">
              {RATE_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            checked={isRemote}
            onChange={(e) => setIsRemote(e.target.checked)}
            className="w-4 h-4"
          />
          This can be done remotely (no in-person location)
        </label>

        {!isRemote && (
          <Field label="Location">
            <input
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Sydney CBD"
              className="input"
            />
          </Field>
        )}

        <Field label="Usage rights (optional)">
          <textarea
            value={usageRights}
            onChange={(e) => setUsageRights(e.target.value)}
            placeholder="e.g. Organic social only, 6 months. Be specific — this becomes part of the booking contract."
            rows={2}
            className="input resize-none"
          />
        </Field>

        {error && (
          <p className="text-sm" style={{ color: "var(--red)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full px-6 py-3.5 font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--blue)" }}
        >
          {loading ? "Posting…" : "Post gig"}
        </button>
      </form>

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
    <label className="flex flex-col gap-1.5 text-sm font-medium flex-1">
      {label}
      {children}
    </label>
  );
}
