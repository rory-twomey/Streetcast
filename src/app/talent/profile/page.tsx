import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

const VERIFICATION_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  unverified: { label: "Not verified yet", bg: "var(--fog)", fg: "var(--graphite)" },
  pending: { label: "Verification pending", bg: "var(--blue-tint)", fg: "var(--blue)" },
  verified: { label: "Verified", bg: "#e3f8e9", fg: "var(--green)" },
  rejected: { label: "Verification failed", bg: "var(--red-tint)", fg: "var(--red)" },
};

export default async function TalentProfilePage() {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, id_verification_status")
    .eq("id", user.id)
    .single();

  const { data: talentProfile } = await supabase
    .from("talent_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const verification =
    VERIFICATION_LABEL[profile?.id_verification_status ?? "unverified"] ??
    VERIFICATION_LABEL.unverified;
  const isVerified = profile?.id_verification_status === "verified";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold tracking-tight">{profile?.full_name ?? "Your profile"}</div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            This is what brands see when they swipe on you in Discover.
          </p>
        </div>
        {isVerified ? (
          <span
            className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap"
            style={{ background: verification.bg, color: verification.fg }}
          >
            {verification.label}
          </span>
        ) : (
          <Link
            href="/verify"
            className="text-[10.5px] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap"
            style={{ background: verification.bg, color: verification.fg }}
          >
            {verification.label} →
          </Link>
        )}
      </div>

      <ProfileForm
        userId={user.id}
        initial={{
          tagline: talentProfile?.tagline ?? "",
          bio: talentProfile?.bio ?? "",
          tags: talentProfile?.tags ?? [],
          interests: talentProfile?.interests ?? [],
          rate_min: talentProfile?.rate_min ?? null,
          rate_max: talentProfile?.rate_max ?? null,
          rate_unit: talentProfile?.rate_unit ?? "hr",
          is_available: talentProfile?.is_available ?? true,
        }}
      />
    </div>
  );
}
