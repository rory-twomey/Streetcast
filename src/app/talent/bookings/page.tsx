import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookingsList } from "@/components/bookings/BookingsList";

type BookingRow = {
  id: string;
  status: string;
  agreed_rate: number;
  scheduled_at: string | null;
  gigs: { title: string } | { title: string }[] | null;
  brand_profiles: { company_name: string } | { company_name: string }[] | null;
};

export default async function TalentBookingsPage() {
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
    .select("id, status, agreed_rate, scheduled_at, gigs(title), brand_profiles(company_name)")
    .eq("talent_id", user.id)
    .order("created_at", { ascending: false });

  const rows = ((bookings ?? []) as BookingRow[]).map((b) => {
    const gig = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
    const brand = Array.isArray(b.brand_profiles) ? b.brand_profiles[0] : b.brand_profiles;
    return {
      id: b.id,
      status: b.status,
      agreedRate: b.agreed_rate,
      scheduledAt: b.scheduled_at,
      gigTitle: gig?.title ?? "A Streetcast gig",
      counterpartyName: brand?.company_name ?? "A Streetcast brand",
    };
  });

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div>
          <div className="text-lg font-bold mb-2">No bookings yet</div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Once a brand confirms you for a gig, it&apos;ll show up here with the contract,
            schedule, and payment status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-8">
      <div className="text-lg font-bold tracking-tight mb-4">Your bookings</div>
      <BookingsList bookings={rows} viewer="talent" />
    </div>
  );
}
