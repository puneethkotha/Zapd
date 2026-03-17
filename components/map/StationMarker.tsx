"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import type { MapboxGeoJSONFeature } from "mapbox-gl"

interface StationMarkerProps {
  feature: MapboxGeoJSONFeature
  onClick?: () => void
  isActive?: boolean
  isCharging?: boolean
}

export function StationMarker({ feature, onClick, isActive, isCharging }: StationMarkerProps) {
  const markerRef = useRef<HTMLDivElement>(null)
  const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice()
  const { id, name, status } = feature.properties ?? {}

  const isAvailable = status === "active" || status === "available"

  useEffect(() => {
    if (!markerRef.current || typeof window === "undefined") return

    const loadMapbox = async () => {
      const mapboxgl = (await import("mapbox-gl")).default
      const marker = new mapboxgl.Marker({ element: markerRef.current! })
        .setLngLat(coordinates as [number, number])
        .addTo((window as unknown as { __ZAPD_MAP?: unknown }).__ZAPD_MAP as mapboxgl.Map)

      return () => marker.remove()
    }

    const map = (window as unknown as { __ZAPD_MAP?: unknown }).__ZAPD_MAP
    if (map) {
      loadMapbox()
    }

    return () => {}
  }, [coordinates])

  return (
    <div
      ref={markerRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={`${name ?? "Station"} - ${isAvailable ? "Available" : "Busy"}`}
      className="cursor-pointer"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
          isCharging
            ? "border-accent bg-accent/20 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            : isAvailable
              ? "border-accent-green bg-accent-green/20"
              : "border-accent-amber bg-accent-amber/20"
        } ${isActive ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
      >
        <Zap className={`h-5 w-5 ${isAvailable ? "text-accent-green" : "text-accent-amber"}`} />
      </motion.div>
      {isCharging && (
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0 rounded-full border-2 border-accent"
        />
      )}
    </div>
  )
}
