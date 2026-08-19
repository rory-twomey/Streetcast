"use client";

import { useRef, useState } from "react";

type SwipeCardProps = {
  isTop: boolean;
  stackPosition: number; // 0 = top card
  onSwiped: (direction: "left" | "right") => void;
  onTap?: () => void;
  children: React.ReactNode;
};

const SWIPE_THRESHOLD = 110;
const TAP_MOVE_TOLERANCE = 6;

/**
 * A single card in a SwipeDeck. Handles its own pointer drag, decides
 * whether a gesture was a tap (opens detail) or a swipe (pass/accept),
 * and animates itself off-screen when swiped.
 */
export function SwipeCard({
  isTop,
  stackPosition,
  onSwiped,
  onTap,
  children,
}: SwipeCardProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const startRef = useRef({ x: 0, y: 0, moved: 0 });

  const offset = stackPosition * 10;
  const scale = 1 - stackPosition * 0.035;
  const opacity = stackPosition > 2 ? 0 : 1;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!isTop) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, moved: 0 };
    setDrag({ x: 0, y: 0, dragging: true });
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isTop || !drag.dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = (e.clientY - startRef.current.y) * 0.4;
    startRef.current.moved = Math.max(
      startRef.current.moved,
      Math.abs(dx) + Math.abs(dy)
    );
    setDrag({ x: dx, y: dy, dragging: true });
  }

  function onPointerUp() {
    if (!isTop || !drag.dragging) return;
    const { x, moved } = { x: drag.x, moved: startRef.current.moved };

    if (moved < TAP_MOVE_TOLERANCE) {
      onTap?.();
      setDrag({ x: 0, y: 0, dragging: false });
      return;
    }
    if (x > SWIPE_THRESHOLD) {
      setExiting("right");
      setDrag((d) => ({ ...d, dragging: false }));
      setTimeout(() => onSwiped("right"), 220);
    } else if (x < -SWIPE_THRESHOLD) {
      setExiting("left");
      setDrag((d) => ({ ...d, dragging: false }));
      setTimeout(() => onSwiped("left"), 220);
    } else {
      setDrag({ x: 0, y: 0, dragging: false });
    }
  }

  let transform: string;
  if (exiting === "right") {
    transform = "translate(600px, -30px) rotate(20deg)";
  } else if (exiting === "left") {
    transform = "translate(-600px, -30px) rotate(-20deg)";
  } else if (isTop && drag.dragging) {
    transform = `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.04}deg)`;
  } else {
    transform = `translateY(${offset}px) scale(${scale})`;
  }

  const passOpacity = isTop && drag.x < -20 ? Math.min(1, (-drag.x - 20) / 60) : 0;
  const acceptOpacity = isTop && drag.x > 20 ? Math.min(1, (drag.x - 20) / 60) : 0;

  return (
    <div
      className="absolute inset-0 rounded-[28px] overflow-hidden bg-white card-shadow touch-none select-none"
      style={{
        border: "0.5px solid var(--hairline)",
        zIndex: 10 - stackPosition,
        transform,
        opacity: exiting ? 0 : opacity,
        transition:
          exiting || !drag.dragging
            ? "transform 0.35s cubic-bezier(.2,.8,.2,1), opacity 0.35s ease"
            : "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}

      {/* Pass / Accept overlay tags, driven by live drag position */}
      <div
        className="absolute top-9 left-4 px-4 py-1.5 rounded-[10px] font-black uppercase text-xl -rotate-6 pointer-events-none"
        style={{ background: "var(--red)", color: "#fff", opacity: passOpacity }}
      >
        Pass
      </div>
      <div
        className="absolute top-9 right-4 px-4 py-1.5 rounded-[10px] font-black uppercase text-xl rotate-6 pointer-events-none"
        style={{ background: "var(--green)", color: "#fff", opacity: acceptOpacity }}
      >
        In
      </div>
    </div>
  );
}
