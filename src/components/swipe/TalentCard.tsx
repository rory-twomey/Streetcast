import { MapPin, DollarSign, Star } from "lucide-react";
import type { TalentProfile } from "@/types/domain";

export function TalentCard({ talent }: { talent: TalentProfile }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="relative h-[54%] shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0071e318, #ffffff 68%)" }}
      >
        <div className="text-7xl font-black" style={{ color: "var(--ink)", opacity: 0.1 }}>
          {talent.initials}
        </div>
        <div className="absolute top-3.5 left-3.5 frosted rounded-[14px] px-3 py-2 font-mono font-semibold text-base leading-none flex items-center gap-1">
          <Star size={14} fill="currentColor" />
          {talent.rating}
          <span className="block text-[9px] tracking-wider font-semibold mt-1" style={{ color: "var(--graphite)" }}>
            {talent.reviewCount} REVIEWS
          </span>
        </div>
        <div className="absolute top-3.5 right-3.5 frosted rounded-full px-2.5 py-1.5 text-[11px] font-semibold flex items-center gap-1">
          <MapPin size={11} />
          {talent.distanceKm} km
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-4 pb-4.5 flex-1 min-h-0" style={{ borderTop: "0.5px solid var(--hairline)" }}>
        <div className="flex gap-1.5 flex-wrap">
          {talent.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px]"
              style={{ color: "var(--blue)", background: "var(--blue-tint)" }}
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-bold leading-tight -tracking-tight">{talent.name}</h2>
        <p className="text-[13px] leading-snug line-clamp-2" style={{ color: "var(--graphite)" }}>
          {talent.tagline}
        </p>
        <div
          className="flex gap-4 mt-auto pt-2.5"
          style={{ borderTop: "0.5px solid var(--hairline)" }}
        >
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold" style={{ color: "var(--graphite)" }}>
            <DollarSign size={13} />
            {talent.rateRangeLabel}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold" style={{ color: "var(--graphite)" }}>
            <MapPin size={13} />
            {talent.locationText}
          </div>
        </div>
      </div>
    </div>
  );
}
