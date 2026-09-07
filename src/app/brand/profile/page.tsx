import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BrandProfileForm } from "./BrandProfileForm";

const VERIFICATION_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  unverified: { label: "Not verified", bg: "var(--fog)", fg: "var(--graphite)" },
  pending: { label: "Pending review", bg: "var(--blue-tint)", fg: "var(--blue)" },
  verified: { label: "Verified business", bg: "#e3f8e9", fg: "var(--green)" },
  rejected: { label: "Verification failed", bg: "var(--red-tint)", fg: "var(--red)" },
};

export default async function BrandProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div>
          <div className="text-lg font-bold mb-2">Log in to see your profile</div>
          <Link href="/login" className="text-sm underline" style={{ color: "var(--blue)" }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const { data: brandProfile } = await supabase
    .from("brand_profiles")
    .select("company_name, abn, website, business_verification_status")
    .eq("id", user.id)
    .single();

  const status = brandProfile?.business_verification_status ?? "unverified";
  const verification = VERIFICATION_LABEL[status] ?? VERIFICATION_LABEL.unverified;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold tracking-tight">
            {brandProfile?.company_name ?? "Your business"}
          </div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Verified businesses show a badge talent can see before applying.
          </p>
        </div>
        <span
          className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap"
          style={{ background: verification.bg, color: verification.fg }}
        >
          {verification.label}
        </span>
      </div>

      <BrandProfileForm
        userId={user.id}
        status={status}
        initial={{
          company_name: brandProfile?.company_name ?? "",
          abn: brandProfile?.abn ?? "",
          website: brandProfile?.website ?? "",
        }}
      />
    </div>
  );
}
