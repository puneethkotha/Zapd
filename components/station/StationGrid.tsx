"use client"

import { motion } from "framer-motion"
import type { Station } from "@/types"
import { StationCard } from "./StationCard"

interface StationGridProps {
  stations: Station[]
  distances?: Map<string, number>
  onStationClick?: (station: Station) => void
}

export function StationGrid({
  stations,
  distances = new Map(),
  onStationClick,
}: StationGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      {stations.map((station, index) => (
        <motion.div
          key={station.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <StationCard
            station={station}
            distance={distances.get(station.id)}
            onClick={() => onStationClick?.(station)}
          />
        </motion.div>
      ))}
    </div>
  )
}
