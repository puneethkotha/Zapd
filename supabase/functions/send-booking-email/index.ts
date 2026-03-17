import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@3"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

serve(async (req) => {
  try {
    const { to, subject, type, data } = await req.json()

    let html = ""
    if (type === "confirmation") {
      html = `
        <h1>Booking Confirmed</h1>
        <p>Your charging session at ${data.stationName} is confirmed.</p>
        <p>Date: ${data.date}</p>
        <p>Time: ${data.time}</p>
        <p>Total: $${(data.amountCents / 100).toFixed(2)}</p>
      `
    } else if (type === "completed") {
      html = `
        <h1>Charging Complete</h1>
        <p>Your session at ${data.stationName} is complete.</p>
        <p>kWh delivered: ${data.kwhDelivered}</p>
        <p>Total: $${(data.amountCents / 100).toFixed(2)}</p>
      `
    } else if (type === "cancelled") {
      html = `
        <h1>Booking Cancelled</h1>
        <p>Your booking at ${data.stationName} has been cancelled. A refund will be processed.</p>
      `
    }

    const { data: email, error } = await resend.emails.send({
      from: "ZAPD <noreply@zapd.app>",
      to,
      subject,
      html,
    })

    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true, email }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
})
