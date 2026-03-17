"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Booking } from "@/types"

interface CreateBookingParams {
  slotId: string
  stationId: string
  driverId: string
  amountCents: number
}

export function useBooking() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const createCheckout = useMutation({
    mutationFn: async (params: CreateBookingParams) => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message ?? "Failed to create checkout")
      }
      const { url } = (await res.json()) as { url: string }
      return url
    },
    onSuccess: (url) => {
      if (url) window.location.href = url
    },
  })

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })

  return { createCheckout, cancelBooking }
}
