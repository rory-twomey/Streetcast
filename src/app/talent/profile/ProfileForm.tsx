"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TAG_OPTIONS = ["Photoshoot", "Event Promo", "Content Video", "Fitting", "Other"];
const RATE_UNITS: { value: string; label: string }[] = [
  { value: "hr", label: "Per hour" },
  { value: "flat", label: "Flat rate" },
  { value: "half_day", label: "Half day" },
  { value: "day", label: "Full day" },
];

type ProfileFormValues = {
  tagline: string;
  bio: string;
  tags: string[];
  interests: string[];
  rate_min: number | null;
  rate_max: number | null;
  rate_unit: string;
  is_available: boolean;
};

export function ProfileForm({
  userId,
  initial,
}: {
  userId: string;
  initial: ProfileFormValues;
}) {
  const [tagline, setTagline] = useState(initial.tagline);
  const [bio, setBio] = useState(initial.bio);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [interestsText, setInterestsText] = useState(initial.interests.join(", "));
  const [rateMin, setRateMin] = useState(initial.rate_min?.toString() ?? "");
  const [rateMax, setRateMax] = useState(initial.rate_max?.toString() ?? "");
  const [rateUnit, setRateUnit] = useState(initial.rate_unit);
  const [isAvailable, setIsAvailable] = useState(initial.is_available);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const supabase = createClient();
    const interests = interestsText
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const { error: updateError } = await supabase
      .from("talent_profiles")
      .update({
        tagline,
        bio,
        tags,
        interests,
        rate_min: rateMin ? Number(rateMin) : null,
        rate_max: rateMax ? Number(rateMax) : null,
        rate_unit: rateUnit,
        is_available: isAvailable,
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Tagline">
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Content creator & part-time model based in Sydney"
          className="input"
        />
      </Field>

      <Field label="About you">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="What kind of gigs are you into? What makes you a good fit for brands?"
          rows={4}
          className="input resize-none"
        />
      </Field>

      <div>
        <div className="text-sm font-medium mb-2">What you&apos;re up for</div>
        <div className="flex gap-2 flex-wrap">
          {TAG_OPTIONS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className="text-xs font-semibold px-3 py-2 rounded-[10px]"
                style={
                  active
                    ? { background: "var(--blue)", color: "#fff" }
                    : { background: "var(--fog)", color: "var(--graphite)" }
                }
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Interests (comma separated)">
        <input
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          placeholder="Skincare, hiking, coffee, thrifting"
          className="input"
        />
      </Field>

      <div className="flex gap-3">
        <Field label="Min rate ($)">
          <input
            type="number"
            min="0"
            value={rateMin}
            onChange={(e) => setRateMin(e.target.value)}
            placeholder="40"
            className="input"
          />
        </Field>
        <Field label="Max rate ($)">
          <input
            type="number"
            min="0"
            value={rateMax}
            onChange={(e) => setRateMax(e.target.value)}
            placeholder="90"
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
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="w-4 h-4"
        />
        Currently available for gigs
      </label>

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
        disabled={loading}
        className="mt-2 rounded-full px-6 py-3.5 font-semibold text-white disabled:opacity-50"
        style={{ background: "var(--blue)" }}
      >
        {loading ? "Saving…" : "Save profile"}
      </button>

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
    </form>
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
