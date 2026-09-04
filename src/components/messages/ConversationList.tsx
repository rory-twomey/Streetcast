import Link from "next/link";
import type { ConversationPartner } from "@/lib/messaging";

export function ConversationList({
  partners,
  basePath,
}: {
  partners: ConversationPartner[];
  basePath: string;
}) {
  if (partners.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div>
          <div className="text-lg font-bold mb-2">No messages yet</div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Conversations open once you apply, get shortlisted, or shortlist someone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6 flex flex-col gap-2">
      {partners.map((p) => (
        <Link
          key={p.id}
          href={`${basePath}/${p.id}`}
          className="flex items-center gap-3 rounded-[16px] p-3.5"
          style={{ background: "#fff", border: "0.5px solid var(--hairline)" }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
            style={{ background: "linear-gradient(160deg, #0071e3, #0071e3cc)", color: "#fff" }}
          >
            {p.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm truncate">{p.name}</span>
              {p.unreadCount > 0 && (
                <span
                  className="text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0"
                  style={{ background: "var(--blue)", color: "#fff" }}
                >
                  {p.unreadCount}
                </span>
              )}
            </div>
            <div className="text-xs truncate" style={{ color: "var(--graphite)" }}>
              {p.lastMessage ?? p.subtitle}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
