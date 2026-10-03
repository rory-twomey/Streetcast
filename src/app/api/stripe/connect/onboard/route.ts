import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payouts aren't configured yet (STRIPE_SECRET_KEY missing)." },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = new URL(request.url).origin;

  try {
    const { data: talentProfile } = await supabase
      .from("talent_profiles")
      .select("stripe_connect_account_id")
      .eq("id", user.id)
      .single();

    let accountId = talentProfile?.stripe_connect_account_id ?? null;

    if (!accountId) {
      // Stripe no longer allows this platform to create v1 Accounts in live mode,
      // so new connected accounts are created via the v2 Core Accounts API instead.
      const account = await stripe.v2.core.accounts.create({
        contact_email: user.email,
        dashboard: "express",
        identity: { country: "au" },
        defaults: {
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: { requested: true },
              },
            },
          },
        },
        metadata: { user_id: user.id },
      });
      accountId = account.id;

      await supabase
        .from("talent_profiles")
        .update({ stripe_connect_account_id: accountId })
        .eq("id", user.id);
    }

    const accountLink = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: `${origin}/payouts`,
          return_url: `${origin}/api/stripe/connect/return`,
        },
      },
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't start payout setup.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
