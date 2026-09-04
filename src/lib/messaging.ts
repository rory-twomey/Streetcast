import type { SupabaseClient } from "@supabase/supabase-js";

export type ConversationPartner = {
  id: string;
  name: string;
  initials: string;
  subtitle: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ThreadMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

function initialsFrom(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Conversation partners aren't stored directly — they're derived from who
 * you've applied to / shortlisted / been shortlisted by. There's no
 * "match" or "booking" concept yet (see README), so a swipe with
 * direction 'right' is what unlocks the ability to message someone.
 */
export async function getConversationPartners(
  supabase: SupabaseClient,
  userId: string,
  role: "talent" | "brand"
): Promise<ConversationPartner[]> {
  const candidates = new Map<string, string>(); // partnerId -> subtitle

  if (role === "talent") {
    const { data: applied } = await supabase
      .from("gig_swipes")
      .select("gigs(brand_id, title)")
      .eq("talent_id", userId)
      .eq("direction", "right");

    for (const row of (applied ?? []) as { gigs: unknown }[]) {
      const gig = Array.isArray(row.gigs) ? row.gigs[0] : row.gigs;
      const g = gig as { brand_id?: string; title?: string } | null;
      if (g?.brand_id) candidates.set(g.brand_id, `Re: ${g.title ?? "your application"}`);
    }

    const { data: shortlisted } = await supabase
      .from("talent_swipes")
      .select("brand_id")
      .eq("talent_id", userId)
      .eq("direction", "right");

    for (const row of (shortlisted ?? []) as { brand_id: string }[]) {
      if (!candidates.has(row.brand_id)) candidates.set(row.brand_id, "Shortlisted you");
    }
  } else {
    const { data: shortlisted } = await supabase
      .from("talent_swipes")
      .select("talent_id")
      .eq("brand_id", userId)
      .eq("direction", "right");

    for (const row of (shortlisted ?? []) as { talent_id: string }[]) {
      candidates.set(row.talent_id, "You shortlisted them");
    }

    const { data: applied } = await supabase
      .from("gig_swipes")
      .select("talent_id, gigs!inner(brand_id, title)")
      .eq("direction", "right")
      .eq("gigs.brand_id", userId);

    for (const row of (applied ?? []) as { talent_id: string; gigs: unknown }[]) {
      if (candidates.has(row.talent_id)) continue;
      const gig = Array.isArray(row.gigs) ? row.gigs[0] : row.gigs;
      const g = gig as { title?: string } | null;
      candidates.set(row.talent_id, `Applied to ${g?.title ?? "your gig"}`);
    }
  }

  const partnerIds = Array.from(candidates.keys());
  if (partnerIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("id", partnerIds);

  const profileList = (profiles ?? []) as { id: string; full_name: string; role: string }[];
  const brandIds = profileList.filter((p) => p.role === "brand").map((p) => p.id);

  let companyNames: Record<string, string> = {};
  if (brandIds.length > 0) {
    const { data: brandProfiles } = await supabase
      .from("brand_profiles")
      .select("id, company_name")
      .in("id", brandIds);
    companyNames = Object.fromEntries(
      ((brandProfiles ?? []) as { id: string; company_name: string }[]).map((b) => [b.id, b.company_name])
    );
  }

  const partners: ConversationPartner[] = [];

  for (const partnerId of partnerIds) {
    const profile = profileList.find((p) => p.id === partnerId);
    const name =
      profile?.role === "brand" ? companyNames[partnerId] ?? "A brand" : profile?.full_name ?? "Streetcast member";

    const { data: lastMsgs } = await supabase
      .from("messages")
      .select("body, created_at")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`
      )
      .order("created_at", { ascending: false })
      .limit(1);

    const { count: unreadCount } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_id", partnerId)
      .eq("recipient_id", userId)
      .is("read_at", null);

    const last = (lastMsgs ?? [])[0] as { body: string; created_at: string } | undefined;

    partners.push({
      id: partnerId,
      name,
      initials: initialsFrom(name),
      subtitle: candidates.get(partnerId) ?? "",
      lastMessage: last?.body ?? null,
      lastMessageAt: last?.created_at ?? null,
      unreadCount: unreadCount ?? 0,
    });
  }

  partners.sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  return partners;
}

export async function getThreadMessages(
  supabase: SupabaseClient,
  userId: string,
  partnerId: string
): Promise<ThreadMessage[]> {
  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  return ((data ?? []) as { id: string; sender_id: string; body: string; created_at: string }[]).map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    body: m.body,
    createdAt: m.created_at,
  }));
}

/** Best-effort — if this fails (e.g. the read policy hasn't been added yet), it just doesn't clear the badge. */
export async function markThreadRead(supabase: SupabaseClient, userId: string, partnerId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", partnerId)
    .eq("recipient_id", userId)
    .is("read_at", null);
}

export async function getPartnerName(supabase: SupabaseClient, partnerId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", partnerId)
    .single();

  const p = profile as { full_name: string; role: string } | null;
  if (!p) return "Streetcast member";

  if (p.role === "brand") {
    const { data: brand } = await supabase
      .from("brand_profiles")
      .select("company_name")
      .eq("id", partnerId)
      .single();
    return (brand as { company_name: string } | null)?.company_name ?? "A brand";
  }

  return p.full_name ?? "Streetcast member";
}
