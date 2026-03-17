"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface HostStats {
  totalEarnings: number
  activeSessions: number
  totalKwh: number
  avgRating: number
  earningsByDay: { date: string; amount: number }[]
}

export function useHostStats(hostId: string | null) {
  return useQuery({
    queryKey: ["host-stats", hostId],
    queryFn: async (): Promise<HostStats> => {
      if (!hostId) throw new Error("No host ID")

      const supabase = createClient()

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: hostStations } = await supabase
        .from("stations")
        .select("id")
        .eq("host_id", hostId)
      const stationIds = (hostStations ?? []).map((s) => s.id)
      if (stationIds.length === 0) {
        return { totalEarnings: 0, activeSessions: 0, totalKwh: 0, avgRating: 0, earningsByDay: [] }
      }

      const { data: bookings } = await supabase
        .from("bookings")
        .select("amount_cents, kwh_delivered, status, created_at")
        .in("station_id", stationIds)
        .in("status", ["confirmed", "active", "completed"])
        .gte("created_at", thirtyDaysAgo.toISOString())

      const totalEarnings =
        (bookings ?? []).reduce((sum, b) => sum + (b.amount_cents ?? 0), 0) / 100
      const activeSessions = (bookings ?? []).filter(
        (b) => b.status === "active",
      ).length
      const totalKwh =
        (bookings ?? []).reduce((sum, b) => sum + (b.kwh_delivered ?? 0), 0)

      const earningsByDayMap = new Map<string, number>()
      for (const b of bookings ?? []) {
        const day = new Date(b.created_at).toISOString().slice(0, 10)
        earningsByDayMap.set(
          day,
          (earningsByDayMap.get(day) ?? 0) + (b.amount_cents ?? 0) / 100,
        )
      }

      const earningsByDay = Array.from(earningsByDayMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        totalEarnings,
        activeSessions,
        totalKwh,
        avgRating: 4.5,
        earningsByDay,
      }
    },
    enabled: !!hostId,
  })
}
