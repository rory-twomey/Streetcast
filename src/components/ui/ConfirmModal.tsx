"use client";

import { Check } from "lucide-react";

export function ConfirmModal({
  title,
  message,
  onClose,
}: {
  title: string;
  message: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 z-30"
      style={{ background: "rgba(245,245,247,.9)", backdropFilter: "blur(24px)" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: "var(--green)" }}
      >
        <Check size={30} color="#fff" strokeWidth={3} />
      </div>
      <h3 className="text-xl font-extrabold mb-2">{title}</h3>
      <p className="text-sm leading-relaxed max-w-[260px]" style={{ color: "var(--graphite)" }}>
        {message}
      </p>
      <button
        onClick={onClose}
        className="mt-5 rounded-full px-6 py-3 text-sm font-semibold text-white"
        style={{ background: "var(--blue)" }}
      >
        Continue
      </button>
    </div>
  );
}
