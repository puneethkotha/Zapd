import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slotId, stationId, driverId, amountCents, successUrl, cancelUrl } = body

    if (!slotId || !stationId || !driverId || !amountCents) {
      return NextResponse.json(
        { error: "Missing required fields: slotId, stationId, driverId, amountCents" },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== driverId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "EV Charging Session",
              description: "Reserved charging slot",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/bookings?success=true`,
      cancel_url: cancelUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/stations/${stationId}`,
      metadata: {
        slot_id: slotId,
        station_id: stationId,
        driver_id: driverId,
      },
    })

    const { data: booking } = await supabase
      .from("bookings")
      .insert({
        driver_id: driverId,
        slot_id: slotId,
        station_id: stationId,
        stripe_session_id: session.id,
        amount_cents: amountCents,
        status: "pending",
      })
      .select("id")
      .single()

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      bookingId: booking?.id,
    })
  }
  catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    )
  }
}
