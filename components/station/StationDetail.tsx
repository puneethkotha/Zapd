"use client"

import { useMemo } from "react"
import {
  MapPin,
  Zap,
  Wifi,
  Coffee,
  Bath,
  Star,
  Clock,
} from "lucide-react"
import type { Station, Slot } from "@/types"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { ConnectorBadge } from "@/components/ui/ConnectorBadge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  coffee: Coffee,
  restroom: Bath,
}

interface StationDetailProps {
  station: Station
  slots?: Slot[]
  onBookClick?: () => void
}

export function StationDetail({
  station,
  slots = [],
  onBookClick,
}: StationDetailProps) {
  const todaySlots = useMemo(() => {
    const today = new Date().toDateString()
    return slots
      .filter((s) => new Date(s.start_time).toDateString() === today)
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      )
  }, [slots])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
          {station.name}
        </h1>
        <p className="mt-2 text-text-secondary">{station.description}</p>
      </div>

      {station.address && (
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-text-muted" />
          <div>
            <p className="text-text-primary">{station.address}</p>
            {(station.city || station.state) && (
              <p className="text-sm text-text-muted">
                {[station.city, station.state, station.zip]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          {station.power_kw} kW
        </Badge>
        {station.connector_types.map((c) => (
          <ConnectorBadge key={c} type={c} />
        ))}
      </div>

      {station.amenities.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {station.amenities.map((amenity) => {
            const Icon = AMENITY_ICONS[amenity.toLowerCase()]
            return (
              <div
                key={amenity}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                {Icon ? (
                  <Icon className="h-4 w-4 text-text-muted" />
                ) : (
                  <Zap className="h-4 w-4 text-text-muted" />
                )}
                <span className="capitalize">{amenity}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
        <div>
          <p className="text-sm text-text-muted">Price</p>
          <p className="font-mono text-xl tabular-nums text-accent">
            ${station.price_per_kwh.toFixed(2)}
            <span className="text-base font-normal text-text-muted">/kWh</span>
          </p>
        </div>
        {station.avg_rating != null && (
          <div className="text-right">
            <p className="text-sm text-text-muted">Rating</p>
            <p className="flex items-center justify-end gap-1 font-medium">
              <Star className="h-4 w-4 fill-accent-amber text-accent-amber" />
              {station.avg_rating.toFixed(1)} ({station.total_reviews})
            </p>
          </div>
        )}
      </div>

      {todaySlots.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-medium">
            <Clock className="h-4 w-4" />
            Today&apos;s availability
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {todaySlots.map((slot) => (
              <div
                key={slot.id}
                className={cn(
                  "flex shrink-0 flex-col rounded-lg border px-3 py-2 min-w-[100px]",
                  slot.status === "available"
                    ? "border-accent/50 bg-accent/5"
                    : "border-border bg-surface",
                )}
              >
                <span className="text-xs text-text-muted">
                  {format(new Date(slot.start_time), "h a")}
                </span>
                <span className="text-sm font-medium capitalize">
                  {slot.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onBookClick && (
        <Button
          size="lg"
          className="w-full"
          onClick={onBookClick}
        >
          Book a Slot
        </Button>
      )}
    </div>
  )
}
