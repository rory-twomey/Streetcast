"use client";

import { useState } from "react";
import { MapPin, Star } from "lucide-react";
import { TalentMap } from "@/components/map/TalentMap";
import { ProfileSheet } from "@/components/profile/ProfileSheet";
import type { TalentProfile } from "@/types/domain";

export function MapClient({
  talent,
  center,
  mapboxToken,
}: {
  talent: TalentProfile[];
  center: { lat: number; lng: number };
  mapboxToken: string | null;
}) {
  const [view, setView] = useState<"map" | "list">(mapboxToken ? "map" : "list");
  const [openProfile, setOpenProfile] = useState<TalentProfile | null>(null);

  const sorted = [...talent].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 pt-4 pb-6">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex gap-1 p-0.5 rounded-[10px]" style={{ background: "var(--fog)" }}>
          {(["map", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              disabled={mode === "map" && !mapboxToken}
              className="text-[11px] font-semibold px-3.5 py-1.5 rounded-[8px] capitalize disabled:opacity-40"
              style={
                view === mode
                  ? { background: "var(--ink)", color: "#fff" }
                  : { background: "transparent", color: "var(--graphite)" }
              }
            >
              {mode}
            </button>
          ))}
        </div>
        <span className="text-[11px] font-mono" style={{ color: "var(--graphite)" }}>
          {sorted.length} nearby
        </span>
      </div>

      {view === "map" && mapboxToken ? (
        <TalentMap talent={sorted} center={center} mapboxToken={mapboxToken} onSelect={setOpenProfile} />
      ) : (
        <>
          {!mapboxToken && (
            <div
              className="rounded-[18px] p-4 mb-4 text-xs leading-relaxed"
              style={{ background: "var(--blue-tint)", color: "var(--blue)" }}
            >
              List view — add NEXT_PUBLIC_MAPBOX_TOKEN to enable the live map.
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {sorted.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setOpenProfile(t)}
                className="w-full flex items-center gap-3.5 rounded-[16px] p-3.5 mb-2.5 text-left"
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
                  <div
                    className="font-mono text-[11px] flex items-center gap-1"
                    style={{ color: "var(--graphite)" }}
                  >
                    <MapPin size={11} />
                    {t.distanceKm ?? "?"} km · {t.rateRangeLabel} ·
                    <Star size={11} fill="currentColor" /> {t.rating}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {openProfile && (
        <ProfileSheet
          talent={openProfile}
          onClose={() => setOpenProfile(null)}
          onPass={() => setOpenProfile(null)}
          onShortlist={() => setOpenProfile(null)}
        />
      )}
    </div>
  );
}
