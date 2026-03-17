"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Station } from "@/types"

const DEFAULT_CENTER = { lat: 40.7484, lng: -73.9857 }

interface UseNearbyStationsOptions {
  latitude?: number | null
  longitude?: number | null
  connectorFilter?: string[] | null
  enabled?: boolean
}

export function useNearbyStations(
  options: UseNearbyStationsOptions = {},
) {
  const {
    connectorFilter,
    enabled = true,
  } = options

  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUserLocation(DEFAULT_CENTER),
    )
  }, [])

  const lat = options.latitude ?? userLocation?.lat ?? DEFAULT_CENTER.lat
  const lng = options.longitude ?? userLocation?.lng ?? DEFAULT_CENTER.lng

  const supabase = createClient()

  return useQuery({
    queryKey: ["nearby-stations", lat, lng, connectorFilter],
    queryFn: async (): Promise<Station[]> => {
      const { data, error } = await supabase
        .from("stations")
        .select("*")
        .eq("status", "active")

      if (error) throw error
      if (!data) return []

      let stations = data as Station[]

      if (connectorFilter && connectorFilter.length > 0) {
        stations = stations.filter((s) =>
          s.connector_types.some((c) => connectorFilter.includes(c)),
        )
      }

      stations.sort((a, b) => {
        const distA = Math.hypot(a.latitude - lat, a.longitude - lng)
        const distB = Math.hypot(b.latitude - lat, b.longitude - lng)
        return distA - distB
      })

      return stations
    },
    enabled,
  })
}
