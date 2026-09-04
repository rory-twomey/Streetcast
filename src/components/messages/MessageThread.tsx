"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ThreadMessage } from "@/lib/messaging";

export function MessageThread({
  currentUserId,
  partnerId,
  partnerName,
  backHref,
  initialMessages,
}: {
  currentUserId: string;
  partnerId: string;
  partnerName: string;
  backHref: string;
  initialMessages: ThreadMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    setDraft("");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({ sender_id: currentUserId, recipient_id: partnerId, body })
      .select("id, sender_id, body, created_at")
      .single();

    if (!error && data) {
      const row = data as { id: string; sender_id: string; body: string; created_at: string };
      setMessages((prev) => [
        ...prev,
        { id: row.id, senderId: row.sender_id, body: row.body, createdAt: row.created_at },
      ]);
    } else if (error) {
      console.error("Couldn't send message:", error.message);
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "0.5px solid var(--hairline)" }}
      >
        <Link href={backHref} className="flex items-center justify-center w-8 h-8 -ml-1.5">
          <ChevronLeft size={20} />
        </Link>
        <span className="font-bold text-base">{partnerName}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {messages.length === 0 && (
          <p className="text-sm text-center mt-8" style={{ color: "var(--graphite)" }}>
            Say hello — this is the start of your conversation.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className="max-w-[75%] rounded-[16px] px-3.5 py-2.5 text-sm"
              style={
                mine
                  ? { alignSelf: "flex-end", background: "var(--blue)", color: "#fff" }
                  : { alignSelf: "flex-start", background: "var(--fog)", color: "var(--ink)" }
              }
            >
              {m.body}
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderTop: "0.5px solid var(--hairline)" }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message..."
          className="flex-1 rounded-full px-4 py-2.5 text-sm"
          style={{ border: "1px solid var(--hairline)" }}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
          style={{ background: "var(--blue)", color: "#fff" }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
