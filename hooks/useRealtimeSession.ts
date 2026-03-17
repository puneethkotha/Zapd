"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ChargingSession } from "@/types"

export interface RealtimeSessionState {
  currentKw: number
  kwhDelivered: number
  batteryPercent: number
  status: ChargingSession["status"]
  elapsedSeconds: number
  updatedAt: string | null
}

export function useRealtimeSession(bookingId: string | null) {
  const [state, setState] = useState<RealtimeSessionState>({
    currentKw: 0,
    kwhDelivered: 0,
    batteryPercent: 0,
    status: "initializing",
    elapsedSeconds: 0,
    updatedAt: null,
  })

  useEffect(() => {
    if (!bookingId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`charging-session-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "charging_sessions",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const record = payload.new as ChargingSession
          if (record) {
            setState({
              currentKw: record.current_kw,
              kwhDelivered: record.kwh_delivered,
              batteryPercent: record.battery_percent,
              status: record.status,
              elapsedSeconds: 0,
              updatedAt: record.updated_at,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId])

  return state
}
