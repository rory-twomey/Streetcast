import { mockTalent } from "@/lib/mock-data";
import { MapPin, Star } from "lucide-react";

// This is a placeholder list view standing in for the real map.
// See README.md → "Next steps for Claude Code" for wiring up Mapbox
// or Google Maps with real (fuzzed) coordinates from talent_profiles.

export default function BrandMapPage() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6">
      <div
        className="rounded-[18px] p-4 mb-4 text-xs leading-relaxed"
        style={{ background: "var(--blue-tint)", color: "var(--blue)" }}
      >
        Map view placeholder — showing a distance-sorted list until a real map
        SDK is wired in. Locations are always shown fuzzed to the nearest km
        until a booking is confirmed.
      </div>

      {[...mockTalent]
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
        .map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3.5 rounded-[16px] p-3.5 mb-2.5"
            style={{ background: "#fff", border: "0.5px solid var(--hairline)" }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: "linear-gradient(160deg, #0071e3, #0071e3cc)", color: "#fff" }}
            >
              {t.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="font-mono text-[11px] flex items-center gap-1" style={{ color: "var(--graphite)" }}>
                <MapPin size={11} />
                {t.distanceKm} km · {t.rateRangeLabel} ·
                <Star size={11} fill="currentColor" /> {t.rating}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
