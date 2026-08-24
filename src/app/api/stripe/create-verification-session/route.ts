import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Identity verification isn't configured yet (STRIPE_SECRET_KEY missing)." },
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
    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { user_id: user.id },
      return_url: `${origin}/verify?status=pending`,
    });

    // Mark as pending immediately, rather than waiting for the webhook —
    // gives the person instant feedback if they navigate back before
    // Stripe's webhook has had a chance to arrive.
    await supabase
      .from("profiles")
      .update({
        id_verification_status: "pending",
        id_verification_provider_ref: session.id,
      })
      .eq("id", user.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't start verification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
