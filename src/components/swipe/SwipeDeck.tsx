"use client";

import { useEffect, useRef, useState } from "react";
import { SwipeCard, type SwipeCardHandle } from "./SwipeCard";

export type SwipeDeckHandle<T> = {
  swipeLeft: () => void;
  swipeRight: () => void;
  getCurrent: () => T | undefined;
};

type SwipeDeckProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onSwipeRight?: (item: T) => void;
  onSwipeLeft?: (item: T) => void;
  onTap?: (item: T) => void;
  emptyState: React.ReactNode;
  /**
   * Optional ref that gets populated with swipeLeft/swipeRight/getCurrent,
   * so buttons rendered outside this component (the pass/accept controls)
   * can trigger the same swipe the user would get from dragging.
   */
  controlsRef?: React.MutableRefObject<SwipeDeckHandle<T> | null>;
};

/**
 * Generic swipeable card stack. Used for both "talent swipes on gigs"
 * (Discover, talent-facing) and "brand swipes on talent" (Discover,
 * brand-facing) — the only difference is what renderCard() returns.
 */
export function SwipeDeck<T>({
  items,
  getKey,
  renderCard,
  onSwipeRight,
  onSwipeLeft,
  onTap,
  emptyState,
  controlsRef,
}: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const topCardRef = useRef<SwipeCardHandle>(null);
  const visible = items.slice(index, index + 3);

  function handleSwiped(direction: "left" | "right", item: T) {
    setIndex((i) => i + 1);
    if (direction === "right") onSwipeRight?.(item);
    else onSwipeLeft?.(item);
  }

  // Re-populate on every render (not just mount) so the closures below
  // always see the latest `index`/`items` rather than a stale snapshot.
  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = {
      swipeLeft: () => topCardRef.current?.playExit("left"),
      swipeRight: () => topCardRef.current?.playExit("right"),
      getCurrent: () => items[index],
    };
  });

  if (visible.length === 0) {
    return (
      <div className="relative flex-1 min-h-0 flex items-center justify-center text-center px-8">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      {visible.map((item, i) => (
        <SwipeCard
          key={getKey(item)}
          ref={i === 0 ? topCardRef : undefined}
          isTop={i === 0}
          stackPosition={i}
          onSwiped={(direction) => handleSwiped(direction, item)}
          onTap={() => onTap?.(item)}
        >
          {renderCard(item)}
        </SwipeCard>
      ))}
    </div>
  );
}
