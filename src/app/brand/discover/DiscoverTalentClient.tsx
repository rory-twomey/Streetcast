"use client";

import { useState } from "react";
import { X, Info, Check } from "lucide-react";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import { TalentCard } from "@/components/swipe/TalentCard";
import { ProfileSheet } from "@/components/profile/ProfileSheet";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { TalentProfile } from "@/types/domain";

export function DiscoverTalentClient({ talent }: { talent: TalentProfile[] }) {
  const [openProfile, setOpenProfile] = useState<TalentProfile | null>(null);
  const [confirmed, setConfirmed] = useState<TalentProfile | null>(null);

  function handleShortlist(t: TalentProfile) {
    // TODO: write to `talent_swipes` (direction: 'right') via Supabase here.
    setOpenProfile(null);
    setConfirmed(t);
  }

  function handlePass(t: TalentProfile) {
    // TODO: write to `talent_swipes` (direction: 'left') via Supabase here.
    setOpenProfile(null);
    void t;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <div className="flex-1 min-h-0 mx-5 mt-3.5 relative">
        <SwipeDeck
          items={talent}
          getKey={(t) => t.id}
          renderCard={(t) => <TalentCard talent={t} />}
          onSwipeRight={handleShortlist}
          onSwipeLeft={handlePass}
          onTap={(t) => setOpenProfile(t)}
          emptyState={
            <div>
              <div className="text-lg font-bold mb-2">You&apos;ve seen everyone nearby</div>
              <p className="text-sm" style={{ color: "var(--graphite)" }}>
                Widen your radius or check back as new people join.
              </p>
            </div>
          }
        />

        {openProfile && (
          <ProfileSheet
            talent={openProfile}
            onClose={() => setOpenProfile(null)}
            onPass={() => handlePass(openProfile)}
            onShortlist={() => handleShortlist(openProfile)}
          />
        )}

        {confirmed && (
          <ConfirmModal
            title="Shortlisted!"
            message={
              <>
                <strong style={{ color: "var(--ink)" }}>{confirmed.name}</strong> has been
                added to your shortlist. You can message them from Bookings.
              </>
            }
            onClose={() => setConfirmed(null)}
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-5 px-5 pt-4 pb-5">
        <button
          className="w-13 h-13 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: "var(--red)", color: "#fff" }}
        >
          <X size={22} strokeWidth={2.4} />
        </button>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: "var(--fog)", color: "var(--graphite)" }}
        >
          <Info size={17} strokeWidth={2.4} />
        </button>
        <button
          className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: "var(--green)", color: "#fff" }}
        >
          <Check size={26} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
