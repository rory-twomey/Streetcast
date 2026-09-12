"use client";

import { useState } from "react";
import { Map, Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { TalentProfile } from "@/types/domain";

export function TalentMap({
  talent,
  center,
  mapboxToken,
  onSelect,
}: {
  talent: TalentProfile[];
  center: { lat: number; lng: number };
  mapboxToken: string;
  onSelect: (t: TalentProfile) => void;
}) {
  const [hovered, setHovered] = useState<TalentProfile | null>(null);

  return (
    <div className="relative flex-1 min-h-0 -mx-5 -mb-6">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{ latitude: center.lat, longitude: center.lng, zoom: 11.5 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >
        <Marker latitude={center.lat} longitude={center.lng} anchor="center">
          <div
            className="w-3.5 h-3.5 rounded-full"
            style={{ background: "var(--ink)", border: "2.5px solid #fff", boxShadow: "0 0 0 1px rgba(0,0,0,.15)" }}
          />
        </Marker>

        {talent.map((t) => (
          <Marker
            key={t.id}
            latitude={t.lat}
            longitude={t.lng}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelect(t);
            }}
          >
            <button
              type="button"
              onMouseEnter={() => setHovered(t)}
              onMouseLeave={() => setHovered((h) => (h?.id === t.id ? null : h))}
              className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[11px] cursor-pointer"
              style={{
                background: "linear-gradient(160deg, #0071e3, #0071e3cc)",
                color: "#fff",
                border: "2px solid #fff",
                boxShadow: "0 2px 6px rgba(0,0,0,.25)",
              }}
            >
              {t.initials}
            </button>
          </Marker>
        ))}

        {hovered && (
          <Popup
            latitude={hovered.lat}
            longitude={hovered.lng}
            anchor="top"
            closeButton={false}
            offset={14}
          >
            <div className="text-xs font-semibold px-0.5 py-0.5">
              {hovered.name} · {hovered.distanceKm ?? "?"} km
            </div>
          </Popup>
        )}
      </Map>

      <div
        className="absolute left-5 right-5 bottom-4 rounded-[14px] px-3.5 py-2.5 text-[11px] leading-relaxed"
        style={{ background: "#fffffff2", color: "var(--graphite)", border: "0.5px solid var(--hairline)" }}
      >
        Pins are fuzzed to a rough area, not exact addresses — precise locations only appear once a booking is confirmed.
      </div>
    </div>
  );
}
