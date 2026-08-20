import { Clock, MapPin, Briefcase } from "lucide-react";
import type { Gig } from "@/types/domain";

const rateSubLabel: Record<Gig["rateUnit"], string> = {
  hr: "PER HR",
  flat: "FLAT",
  half_day: "HALF DAY",
  day: "PER DAY",
};

export function GigCard({ gig }: { gig: Gig }) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="relative h-[54%] shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0071e318, #ffffff 68%)" }}
      >
        <div
          className="absolute top-3.5 left-3.5 frosted rounded-[14px] px-3 py-2 font-mono font-semibold text-base leading-none"
          style={{ color: "var(--ink)" }}
        >
          ${gig.rate}
          <span className="block text-[9px] tracking-wider font-semibold mt-1" style={{ color: "var(--graphite)" }}>
            {rateSubLabel[gig.rateUnit]}
          </span>
        </div>
        <div className="absolute top-3.5 right-3.5 frosted rounded-full px-2.5 py-1.5 text-[11px] font-semibold flex items-center gap-1">
          <MapPin size={11} />
          {gig.isRemote ? "Remote" : gig.distanceKm != null ? `${gig.distanceKm} km` : "Nearby"}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-4 pb-4.5 flex-1 min-h-0" style={{ borderTop: "0.5px solid var(--hairline)" }}>
        <div className="font-mono text-[10.5px] font-semibold tracking-wide uppercase" style={{ color: "var(--blue)" }}>
          {gig.category}
        </div>
        <h2 className="text-xl font-bold leading-tight -tracking-tight">{gig.title}</h2>
        <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "var(--graphite)" }}>
          <Briefcase size={13} />
          {gig.brandName}
        </div>
        <p className="text-[13px] leading-snug line-clamp-2" style={{ color: "var(--graphite)" }}>
          {gig.description}
        </p>
        <div
          className="flex gap-4 mt-auto pt-2.5"
          style={{ borderTop: "0.5px solid var(--hairline)" }}
        >
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold" style={{ color: "var(--graphite)" }}>
            <Clock size={13} />
            {gig.durationLabel}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold" style={{ color: "var(--graphite)" }}>
            <MapPin size={13} />
            {gig.locationText}
          </div>
        </div>
      </div>
    </div>
  );
}
