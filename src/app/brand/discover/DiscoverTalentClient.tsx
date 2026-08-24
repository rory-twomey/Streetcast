"use client";

import { useRef, useState } from "react";
import { X, Info, Check } from "lucide-react";
import { SwipeDeck, type SwipeDeckHandle } from "@/components/swipe/SwipeDeck";
import { TalentCard } from "@/components/swipe/TalentCard";
import { ProfileSheet } from "@/components/profile/ProfileSheet";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { VerifyPromptModal } from "@/components/ui/VerifyPromptModal";
import { createClient } from "@/lib/supabase/client";
import type { TalentProfile } from "@/types/domain";

export function DiscoverTalentClient({
  talent,
  isVerified,
}: {
  talent: TalentProfile[];
  isVerified: boolean;
}) {
  const [openProfile, setOpenProfile] = useState<TalentProfile | null>(null);
  const [confirmed, setConfirmed] = useState<TalentProfile | null>(null);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const deckControls = useRef<SwipeDeckHandle<TalentProfile> | null>(null);

  async function recordSwipe(talentId: string, direction: "left" | "right") {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Not logged in — swipe wasn't saved.");
      return;
    }

    const { error } = await supabase.from("talent_swipes").insert({
      brand_id: user.id,
      talent_id: talentId,
      direction,
    });

    if (error && error.code !== "23505") {
      console.error("Couldn't save swipe:", error.message);
    }
  }

  function handleShortlist(t: TalentProfile) {
    setOpenProfile(null);
    // As with the talent side: unverified brands still see the card swipe
    // away, but the shortlist doesn't actually get recorded until they've
    // verified — they're prompted instead of seeing the normal confirmation.
    if (!isVerified) {
      setShowVerifyPrompt(true);
      return;
    }
    setConfirmed(t);
    recordSwipe(t.id, "right");
  }

  function handlePass(t: TalentProfile) {
    setOpenProfile(null);
    recordSwipe(t.id, "left");
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <div className="flex-1 min-h-0 mx-5 mt-3.5 relative flex flex-col">
        <SwipeDeck
          controlsRef={deckControls}
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

        {showVerifyPrompt && <VerifyPromptModal onClose={() => setShowVerifyPrompt(false)} />}
      </div>

      <div className="flex items-center justify-center gap-5 px-5 pt-4 pb-5">
        <button
          onClick={() => deckControls.current?.swipeLeft()}
          className="w-13 h-13 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: "var(--red)", color: "#fff" }}
        >
          <X size={22} strokeWidth={2.4} />
        </button>
        <button
          onClick={() => {
            const t = deckControls.current?.getCurrent();
            if (t) setOpenProfile(t);
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: "var(--fog)", color: "var(--graphite)" }}
        >
          <Info size={17} strokeWidth={2.4} />
        </button>
        <button
          onClick={() => deckControls.current?.swipeRight()}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: "var(--green)", color: "#fff" }}
        >
          <Check size={26} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
