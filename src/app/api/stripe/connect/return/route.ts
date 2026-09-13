import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(`${origin}/payouts?status=error`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { data: talentProfile } = await supabase
    .from("talent_profiles")
    .select("stripe_connect_account_id")
    .eq("id", user.id)
    .single();

  if (!talentProfile?.stripe_connect_account_id) {
    return NextResponse.redirect(`${origin}/payouts?status=error`);
  }

  try {
    const account = await stripe.accounts.retrieve(talentProfile.stripe_connect_account_id);
    const onboarded = Boolean(account.charges_enabled && account.details_submitted);

    await supabase
      .from("talent_profiles")
      .update({ stripe_connect_onboarded: onboarded })
      .eq("id", user.id);

    return NextResponse.redirect(`${origin}/payouts?status=${onboarded ? "done" : "incomplete"}`);
  } catch {
    return NextResponse.redirect(`${origin}/payouts?status=error`);
  }
}
