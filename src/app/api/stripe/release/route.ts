import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments aren't configured yet (STRIPE_SECRET_KEY missing)." },
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

  const { bookingId } = await request.json();
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId." }, { status: 400 });
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, brand_id, status, payment_status, stripe_payment_intent_id")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.brand_id !== user.id) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status !== "completed") {
    return NextResponse.json(
      { error: "Mark the booking as completed before releasing payment." },
      { status: 400 }
    );
  }
  if (booking.payment_status !== "held" || !booking.stripe_payment_intent_id) {
    return NextResponse.json(
      { error: "There's no held payment on this booking to release." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);

    // The payment_intent.succeeded webhook will also confirm this, but we
    // update here too so the brand sees it release instantly rather than
    // waiting on webhook delivery.
    await supabase
      .from("bookings")
      .update({ payment_status: "released", funds_released_at: new Date().toISOString() })
      .eq("id", booking.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't release payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
