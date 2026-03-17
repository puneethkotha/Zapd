"use client"

import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import type { Station } from "@/types"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { ConnectorBadge } from "@/components/ui/ConnectorBadge"
import { cn } from "@/lib/utils"

interface StationCardProps {
  station: Station
  distance?: number
  onClick?: () => void
  className?: string
}

export function StationCard({ station, distance, onClick, className }: StationCardProps) {
  const isAvailable = station.status === "active"
  const powerLabel =
    station.power_kw >= 50
      ? `${station.power_kw} kW DC Fast`
      : `${station.power_kw} kW`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
      className={className}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-accent/50",
          onClick && "hover:shadow-glow-cyan",
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  isAvailable ? "bg-accent-green animate-pulse" : "bg-accent-amber",
                )}
              />
              <h3 className="truncate font-medium text-text-primary">
                {station.name}
              </h3>
            </div>
            {distance != null && (
              <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                <MapPin className="h-3.5 w-3.5" />
                {distance < 1
                  ? `${Math.round(distance * 1000)} m`
                  : `${distance.toFixed(1)} km`}
              </p>
            )}
          </div>
          <div className="text-right font-mono tabular-nums text-accent">
            ${station.price_per_kwh.toFixed(2)}
            <span className="text-text-muted">/kWh</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {powerLabel}
          </Badge>
          {station.connector_types.map((connector) => (
            <ConnectorBadge key={connector} type={connector} />
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
