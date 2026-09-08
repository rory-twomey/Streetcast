import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookingsList } from "@/components/bookings/BookingsList";

type BookingRow = {
  id: string;
  status: string;
  agreed_rate: number;
  scheduled_at: string | null;
  gigs: { title: string } | { title: string }[] | null;
  talent_profiles:
    | { profiles: { full_name: string } | { full_name: string }[] | null }
    | { profiles: { full_name: string } | { full_name: string }[] | null }[]
    | null;
};

export default async function BrandBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div>
          <div className="text-lg font-bold mb-2">Log in to see your bookings</div>
          <Link href="/login" className="text-sm underline" style={{ color: "var(--blue)" }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, agreed_rate, scheduled_at, gigs(title), talent_profiles(profiles(full_name))")
    .eq("brand_id", user.id)
    .order("created_at", { ascending: false });

  const rows = ((bookings ?? []) as BookingRow[]).map((b) => {
    const gig = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
    const tp = Array.isArray(b.talent_profiles) ? b.talent_profiles[0] : b.talent_profiles;
    const profile = tp ? (Array.isArray(tp.profiles) ? tp.profiles[0] : tp.profiles) : null;
    return {
      id: b.id,
      status: b.status,
      agreedRate: b.agreed_rate,
      scheduledAt: b.scheduled_at,
      gigTitle: gig?.title ?? "A Streetcast gig",
      counterpartyName: profile?.full_name ?? "Streetcast member",
    };
  });

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div>
          <div className="text-lg font-bold mb-2">No bookings yet</div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Confirm a booking from a gig&apos;s applicant list and it&apos;ll show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-8">
      <div className="text-lg font-bold tracking-tight mb-4">Bookings</div>
      <BookingsList bookings={rows} viewer="brand" />
    </div>
  );
}
