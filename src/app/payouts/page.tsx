import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StartPayoutSetupButton } from "./StartPayoutSetupButton";

export default async function PayoutsPage() {
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

  const { data: talentProfile } = await supabase
    .from("talent_profiles")
    .select("stripe_connect_onboarded")
    .eq("id", user.id)
    .single();

  const onboarded = talentProfile?.stripe_connect_onboarded ?? false;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4 max-w-sm mx-auto">
      {onboarded ? (
        <>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "#e3f8e9" }}
          >
            <span style={{ color: "var(--green)", fontSize: 24 }}>✓</span>
          </div>
          <div className="text-lg font-bold">Payouts are set up</div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            When a brand pays for a confirmed booking, funds are held until the gig is
            completed, then paid out to this account — 5% platform fee already taken out.
          </p>
        </>
      ) : (
        <>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "var(--fog)" }}
          >
            <span style={{ color: "var(--graphite)", fontSize: 24 }}>💳</span>
          </div>
          <div className="text-lg font-bold">Set up payouts</div>
          <p className="text-sm" style={{ color: "var(--graphite)" }}>
            Before a brand can pay you for a booking, we need your bank details. It takes
            about 2 minutes through Stripe — Streetcast never sees your account number.
          </p>
          <StartPayoutSetupButton />
        </>
      )}

      <Link href="/talent/profile" className="text-sm underline mt-2" style={{ color: "var(--blue)" }}>
        Back to profile
      </Link>
    </div>
  );
}
