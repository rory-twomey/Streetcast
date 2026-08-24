import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StartVerificationButton } from "./StartVerificationButton";

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 text-center">
        <div>
          <div className="text-lg font-bold mb-2">Log in first</div>
          <Link href="/login" className="text-sm underline" style={{ color: "var(--blue)" }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id_verification_status, role")
    .eq("id", user.id)
    .single();

  const status = profile?.id_verification_status ?? "unverified";
  const backHref = profile?.role === "brand" ? "/brand/gigs" : "/talent/discover";

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4 max-w-sm mx-auto">
      {status === "verified" && (
        <>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "#e3f8e9" }}
          >
            <span style={{ color: "var(--green)", fontSize: 24 }}>✓</span>
          </div>
          <div className="text-lg font-bold">You&apos;re verified</div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Your identity has been confirmed. You&apos;re all set to apply for gigs and get
            booked.
          </p>
        </>
      )}

      {status === "pending" && (
        <>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "var(--blue-tint)" }}
          >
            <span style={{ color: "var(--blue)", fontSize: 24 }}>⏳</span>
          </div>
          <div className="text-lg font-bold">Verification in progress</div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            We&apos;re checking your ID with our verification partner. This usually takes a few
            minutes — check back shortly.
          </p>
        </>
      )}

      {(status === "unverified" || status === "rejected") && (
        <>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "var(--fog)" }}
          >
            <span style={{ color: "var(--graphite)", fontSize: 24 }}>🪪</span>
          </div>
          <div className="text-lg font-bold">
            {status === "rejected" ? "Verification didn't go through" : "Verify your identity"}
          </div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            {status === "rejected"
              ? "Something didn't match up. You can try again with a clearer photo of your ID."
              : "Before you can apply for gigs or shortlist people, we need to confirm you're a real person. It takes about 2 minutes with a photo ID."}
          </p>
          <StartVerificationButton />
        </>
      )}

      <Link href={backHref} className="text-sm underline mt-2" style={{ color: "var(--blue)" }}>
        Back to Streetcast
      </Link>
    </div>
  );
}
