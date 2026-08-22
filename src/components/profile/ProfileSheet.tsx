"use client";

import { X, Star } from "lucide-react";
import type { TalentProfile } from "@/types/domain";

export function ProfileSheet({
  talent,
  onClose,
  onPass,
  onShortlist,
}: {
  talent: TalentProfile;
  onClose: () => void;
  onPass: () => void;
  onShortlist: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-white rounded-t-[32px] overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div
          className="relative h-[190px] flex items-center justify-center mt-1.5"
          style={{ background: "linear-gradient(160deg, #0071e322, #ffffff 78%)" }}
        >
          <div className="text-7xl font-black" style={{ color: "var(--ink)", opacity: 0.1 }}>
            {talent.initials}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3.5 right-4 w-[30px] h-[30px] rounded-full flex items-center justify-center"
            style={{ background: "rgba(118,118,128,.16)" }}
          >
            <X size={14} strokeWidth={2.6} />
          </button>
        </div>

        <div className="flex flex-col gap-4.5 px-5 pt-4 pb-6">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h2 className="text-2xl font-extrabold tracking-tight">{talent.name}</h2>
              <div
                className="flex items-center gap-1 font-mono text-xs font-semibold rounded-full px-2.5 py-1.5 whitespace-nowrap"
                style={{ background: "var(--fog)" }}
              >
                <Star size={12} fill="currentColor" />
                {talent.rating} · {talent.reviewCount} reviews
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {talent.tags.map((tag) => (
                <Chip key={tag} label={tag} />
              ))}
              <Chip label={`${talent.distanceKm} km away`} muted />
            </div>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: "var(--graphite)" }}>
            {talent.bio}
          </p>

          <Section title="Past jobs">
            {talent.pastJobs.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--graphite)" }}>
                No completed gigs on Streetcast yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {talent.pastJobs.map((job) => (
                  <div
                    key={job.title + job.date}
                    className="flex justify-between items-center rounded-[14px] px-3.5 py-3"
                    style={{ background: "var(--fog)" }}
                  >
                    <div>
                      <div className="text-sm font-semibold">{job.title}</div>
                      <div className="text-xs" style={{ color: "var(--graphite)" }}>
                        {job.brand}
                      </div>
                    </div>
                    <div className="font-mono text-[10.5px]" style={{ color: "var(--graphite)" }}>
                      {job.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Interests">
            <div className="flex gap-1.5 flex-wrap">
              {talent.interests.map((i) => (
                <Chip key={i} label={i} muted />
              ))}
            </div>
          </Section>

          <Section title="Reviews from brands">
            {talent.reviews.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--graphite)" }}>
                No reviews yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {talent.reviews.map((r) => (
                  <div key={r.brand} className="pl-3" style={{ borderLeft: "2px solid var(--blue)" }}>
                    <div className="text-xs mb-1" style={{ color: "var(--ink)" }}>
                      {"★".repeat(r.stars)}
                      {"☆".repeat(5 - r.stars)}
                    </div>
                    <p className="text-[13px] leading-snug mb-1">&ldquo;{r.quote}&rdquo;</p>
                    <span className="text-[11px]" style={{ color: "var(--graphite)" }}>
                      {r.brand}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      <div className="flex gap-2.5 px-5 pt-3.5 pb-5" style={{ borderTop: "0.5px solid var(--hairline)" }}>
        <button
          onClick={onPass}
          className="flex-1 rounded-[14px] py-3.5 text-sm font-semibold"
          style={{ background: "var(--red-tint)", color: "var(--red)" }}
        >
          Pass
        </button>
        <button
          onClick={onShortlist}
          className="flex-1 rounded-[14px] py-3.5 text-sm font-semibold text-white"
          style={{ background: "var(--blue)" }}
        >
          Shortlist
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4
        className="text-[11px] font-bold uppercase tracking-wide mb-2.5"
        style={{ color: "var(--graphite)" }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function Chip({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px]"
      style={
        muted
          ? { color: "var(--graphite)", background: "var(--fog)" }
          : { color: "var(--blue)", background: "var(--blue-tint)" }
      }
    >
      {label}
    </span>
  );
}
