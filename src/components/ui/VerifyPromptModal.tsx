"use client";

import Link from "next/link";

export function VerifyPromptModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 z-30"
      style={{ background: "rgba(245,245,247,.94)", backdropFilter: "blur(24px)" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: "var(--fog)" }}
      >
        <span style={{ fontSize: 26 }}>🪪</span>
      </div>
      <h3 className="text-xl font-extrabold mb-2">Verify to continue</h3>
      <p className="text-sm leading-relaxed max-w-[260px]" style={{ color: "var(--graphite)" }}>
        Applying and getting booked on Streetcast requires a quick identity check first — it
        keeps everyone on the platform real. Takes about 2 minutes.
      </p>
      <Link
        href="/verify"
        className="mt-5 rounded-full px-6 py-3 text-sm font-semibold text-white"
        style={{ background: "var(--blue)" }}
      >
        Verify my identity
      </Link>
      <button
        onClick={onClose}
        className="mt-3 text-sm font-medium"
        style={{ color: "var(--graphite)" }}
      >
        Not now
      </button>
    </div>
  );
}
