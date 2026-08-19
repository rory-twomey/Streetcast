import { NextResponse } from "next/server";
import Stripe from "stripe";

// TODO: this is a stub. Real implementation needs to:
//  1. Verify the webhook signature with STRIPE_WEBHOOK_SECRET
//  2. Handle `payment_intent.succeeded` → mark booking as funds-held
//  3. Handle `identity.verification_session.verified` →
//       update profiles.id_verification_status = 'verified'
//  4. Handle `identity.verification_session.requires_input` → 'rejected'
//
// Use the Supabase *service role* client here (not the anon client),
// since this runs with no user session — see lib/supabase/server.ts
// for the pattern, but swap in SUPABASE_SERVICE_ROLE_KEY.

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
      // TODO: mark profiles.id_verification_status = 'verified'
      break;
    case "identity.verification_session.requires_input":
      // TODO: mark profiles.id_verification_status = 'rejected'
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
