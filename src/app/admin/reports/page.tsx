import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReportsClient } from "./ReportsClient";

type ReportRow = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter: { full_name: string } | { full_name: string }[] | null;
  reported_user: { full_name: string } | { full_name: string }[] | null;
  reported_gig: { title: string } | { title: string }[] | null;
};

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center min-h-screen">
        <div>
          <div className="text-lg font-bold mb-2">Log in to continue</div>
          <Link href="/login" className="text-sm underline" style={{ color: "var(--blue)" }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center min-h-screen">
        <div>
          <div className="text-lg font-bold mb-2">Access restricted</div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            This page is only available to Streetcast admins.
          </p>
        </div>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("reports")
    .select(
      "id, reason, details, status, created_at, reporter:profiles!reports_reporter_id_fkey(full_name), reported_user:profiles!reports_reported_user_id_fkey(full_name), reported_gig:gigs!reports_reported_gig_id_fkey(title)"
    )
    .order("created_at", { ascending: false });

  const rows = ((reports ?? []) as ReportRow[]).map((r) => {
    const reporter = Array.isArray(r.reporter) ? r.reporter[0] : r.reporter;
    const reportedUser = Array.isArray(r.reported_user) ? r.reported_user[0] : r.reported_user;
    const reportedGig = Array.isArray(r.reported_gig) ? r.reported_gig[0] : r.reported_gig;
    return {
      id: r.id,
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.created_at,
      reporterName: reporter?.full_name ?? "Unknown",
      reportedName: reportedUser?.full_name ?? null,
      reportedGigTitle: reportedGig?.title ?? null,
    };
  });

  return (
    <div className="flex-1 min-h-screen overflow-y-auto px-5 py-6 max-w-2xl mx-auto w-full">
      <div className="text-lg font-bold tracking-tight mb-4">Reports</div>
      {rows.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--graphite)" }}>
          No reports filed yet.
        </p>
      ) : (
        <ReportsClient reports={rows} />
      )}
    </div>
  );
}
