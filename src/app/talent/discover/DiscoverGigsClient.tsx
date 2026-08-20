"use client";

import { useRef, useState } from "react";
import { X, Info, Check } from "lucide-react";
import { SwipeDeck, type SwipeDeckHandle } from "@/components/swipe/SwipeDeck";
import { GigCard } from "@/components/swipe/GigCard";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { createClient } from "@/lib/supabase/client";
import type { Gig } from "@/types/domain";

export function DiscoverGigsClient({ gigs }: { gigs: Gig[] }) {
  const [confirmed, setConfirmed] = useState<Gig | null>(null);
  const deckControls = useRef<SwipeDeckHandle<Gig> | null>(null);

  async function recordSwipe(gigId: string, direction: "left" | "right") {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Not logged in — swipe wasn't saved.");
      return;
    }

    const { error } = await supabase.from("gig_swipes").insert({
      gig_id: gigId,
      talent_id: user.id,
      direction,
    });

    // Ignore "already swiped this one" errors (unique constraint) — anything
    // else, log it so it's visible in the browser console while we're testing.
    if (error && error.code !== "23505") {
      console.error("Couldn't save swipe:", error.message);
    }
  }

  function handleApply(gig: Gig) {
    setConfirmed(gig);
    recordSwipe(gig.id, "right");
  }

  function handlePass(gig: Gig) {
    recordSwipe(gig.id, "left");
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <div className="flex-1 min-h-0 mx-5 mt-4 relative flex flex-col">
        <SwipeDeck
          controlsRef={deckControls}
          items={gigs}
          getKey={(g) => g.id}
          renderCard={(g) => <GigCard gig={g} />}
          onSwipeRight={handleApply}
          onSwipeLeft={handlePass}
          emptyState={
            <div>
              <div className="text-lg font-bold mb-2">That&apos;s everything nearby</div>
              <p className="text-sm" style={{ color: "var(--graphite)" }}>
                New gigs are posted daily. Widen your radius or check back soon.
              </p>
            </div>
          }
        />
      </div>

      <div className="flex items-center justify-center gap-5 px-5 pt-4 pb-2">
        <ActionButton
          variant="pass"
          icon={<X size={22} strokeWidth={2.4} />}
          onClick={() => deckControls.current?.swipeLeft()}
        />
        <ActionButton
          variant="info"
          icon={<Info size={17} strokeWidth={2.4} />}
          onClick={() => {
            const g = deckControls.current?.getCurrent();
            if (g) alert(`${g.title} — ${g.brandName}\n\n${g.description}`);
          }}
        />
        <ActionButton
          variant="accept"
          icon={<Check size={26} strokeWidth={2.4} />}
          onClick={() => deckControls.current?.swipeRight()}
        />
      </div>

      {confirmed && (
        <ConfirmModal
          title="You're in!"
          message={
            <>
              <strong style={{ color: "var(--ink)" }}>{confirmed.brandName}</strong> will
              review your profile for &ldquo;{confirmed.title}.&rdquo; You&apos;ll hear back
              within 48 hours.
            </>
          }
          onClose={() => setConfirmed(null)}
        />
      )}
    </div>
  );
}

function ActionButton({
  variant,
  icon,
  onClick,
}: {
  variant: "pass" | "info" | "accept";
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const base = "rounded-full flex items-center justify-center transition-transform active:scale-90";
  if (variant === "accept") {
    return (
      <button
        onClick={onClick}
        className={`${base} w-16 h-16`}
        style={{ background: "var(--green)", color: "#fff" }}
      >
        {icon}
      </button>
    );
  }
  if (variant === "info") {
    return (
      <button
        onClick={onClick}
        className={`${base} w-10 h-10`}
        style={{ background: "var(--fog)", color: "var(--graphite)" }}
      >
        {icon}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`${base} w-13 h-13`}
      style={{ background: "var(--red)", color: "#fff" }}
    >
      {icon}
    </button>
  );
}
