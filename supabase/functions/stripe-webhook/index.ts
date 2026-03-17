import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = await import("https://esm.sh/stripe@14?target=deno")
const Stripe = stripe.default

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")
  const body = await req.text()

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing configuration", { status: 500 })
  }

  let event: stripe.Stripe.Event
  try {
    event = Stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  )

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { booking_id?: string } }
    const bookingId = session.metadata?.booking_id
    if (bookingId) {
      await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)
      await supabase
        .from("slots")
        .update({ status: "booked" })
        .eq("id", session.metadata?.slot_id)
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as { metadata?: { booking_id?: string } }
    const bookingId = paymentIntent.metadata?.booking_id
    if (bookingId) {
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
})
