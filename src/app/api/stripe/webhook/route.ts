import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

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
    // Fired when the brand's card is authorized at checkout. With
    // capture_method: "manual" this is an auth-hold, not a charge — the
    // money moves only when /api/stripe/release later calls
    // paymentIntents.capture(). This is what actually puts a booking into
    // escrow, so it's the event that flips payment_status to "held".
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      if (bookingId && paymentIntentId) {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
          .from("bookings")
          .update({ payment_status: "held", stripe_payment_intent_id: paymentIntentId })
          .eq("id", bookingId)
          .eq("payment_status", "unpaid"); // don't clobber a later state on redelivery

        if (error) {
          console.error("Failed to mark booking payment as held:", error.message);
        }
      }
      break;
    }

    // Fires when the held payment is actually captured — normally
    // triggered by /api/stripe/release, which also updates the booking
    // directly. This is a fallback in case that direct update didn't
    // land (e.g. the request dropped after Stripe confirmed capture).
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingId = pi.metadata?.booking_id;

      if (bookingId) {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
          .from("bookings")
          .update({ payment_status: "released", funds_released_at: new Date().toISOString() })
          .eq("id", bookingId)
          .eq("payment_status", "held");

        if (error) {
          console.error("Failed to mark booking payment as released:", error.message);
        }
      }
      break;
    }

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
