import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { getStripe } from "@/lib/stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook config" }, { status: 500 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  }
  catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const { slot_id, station_id, driver_id } = session.metadata ?? {}

    if (slot_id && station_id) {
      await supabaseAdmin
        .from("bookings")
        .update({
          status: "confirmed",
          stripe_payment_intent_id: session.payment_intent as string | null,
        })
        .eq("stripe_session_id", session.id)

      await supabaseAdmin
        .from("slots")
        .update({ status: "booked" })
        .eq("id", slot_id)
    }
  }
  else if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("slot_id")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .single()

    if (booking?.slot_id) {
      await supabaseAdmin
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("stripe_payment_intent_id", paymentIntent.id)

      await supabaseAdmin
        .from("slots")
        .update({ status: "available" })
        .eq("id", booking.slot_id)
    }
  }

  return NextResponse.json({ received: true })
}
