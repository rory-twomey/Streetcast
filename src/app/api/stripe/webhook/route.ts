import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// TODO: payment/escrow events (payment_intent.succeeded etc.) — see
// README "Escrow payments" step. Identity verification is now wired up.

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured (STRIPE_SECRET_KEY missing)" },
      { status: 500 }
    );
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err}` }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      // TODO: mark the related booking's funds as held in escrow
      break;

    case "identity.verification_session.verified":
    case "identity.verification_session.requires_input": {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const userId = session.metadata?.user_id;

      if (userId) {
        const status =
          event.type === "identity.verification_session.verified" ? "verified" : "rejected";

        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ id_verification_status: status })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update verification status:", error.message);
        }
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
