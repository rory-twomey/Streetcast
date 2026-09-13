import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { feeBreakdownFromRate } from "@/lib/fees";

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
    .select("id, brand_id, talent_id, status, payment_status, agreed_rate, gigs(title)")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.brand_id !== user.id) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status !== "confirmed") {
    return NextResponse.json(
      { error: "This booking needs to be confirmed by the talent before it can be paid." },
      { status: 400 }
    );
  }
  if (booking.payment_status !== "unpaid") {
    return NextResponse.json({ error: "This booking has already been paid." }, { status: 400 });
  }

  const { data: talentProfile } = await supabase
    .from("talent_profiles")
    .select("stripe_connect_account_id, stripe_connect_onboarded")
    .eq("id", booking.talent_id)
    .single();

  if (!talentProfile?.stripe_connect_account_id || !talentProfile.stripe_connect_onboarded) {
    return NextResponse.json(
      { error: "This talent hasn't finished setting up payouts yet — check back soon." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = new URL(request.url).origin;
  const { brandChargeCents, talentPayoutCents, platformFeeCents } = feeBreakdownFromRate(
    booking.agreed_rate
  );
  const gig = Array.isArray(booking.gigs) ? booking.gigs[0] : booking.gigs;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "aud",
            unit_amount: brandChargeCents,
            product_data: { name: gig?.title ?? "Streetcast booking" },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: "manual",
        application_fee_amount: platformFeeCents,
        transfer_data: { destination: talentProfile.stripe_connect_account_id },
        metadata: { booking_id: booking.id },
      },
      metadata: { booking_id: booking.id },
      success_url: `${origin}/brand/bookings?payment=success`,
      cancel_url: `${origin}/brand/bookings?payment=cancelled`,
    });

    await supabase
      .from("bookings")
      .update({
        stripe_checkout_session_id: session.id,
        brand_charge_cents: brandChargeCents,
        talent_payout_cents: talentPayoutCents,
        platform_fee_cents: platformFeeCents,
      })
      .eq("id", booking.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't start payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
