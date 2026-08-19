"use client";

import { useState } from "react";
import { SwipeCard } from "./SwipeCard";

type SwipeDeckProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onSwipeRight?: (item: T) => void;
  onSwipeLeft?: (item: T) => void;
  onTap?: (item: T) => void;
  emptyState: React.ReactNode;
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
}: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const visible = items.slice(index, index + 3);

  function handleSwiped(direction: "left" | "right", item: T) {
    setIndex((i) => i + 1);
    if (direction === "right") onSwipeRight?.(item);
    else onSwipeLeft?.(item);
  }

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
