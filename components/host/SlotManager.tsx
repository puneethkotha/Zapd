"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import type { Slot } from "@/types"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"

interface SlotManagerProps {
  stationId: string
  slots?: Slot[]
  onSlotClick?: (slot: Slot) => void
}

const statusVariant = {
  available: "success" as const,
  booked: "secondary" as const,
  charging: "warning" as const,
  completed: "default" as const,
}

export function SlotManager({ stationId, slots: slotsProp, onSlotClick }: SlotManagerProps) {
  const supabase = createClient()
  const { data: fetchedSlots } = useQuery({
    queryKey: ["slots", stationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slots")
        .select("*")
        .eq("station_id", stationId)
        .order("start_time")
      if (error) throw error
      return (data ?? []) as Slot[]
    },
    enabled: !!stationId && !slotsProp,
  })
  const slots = slotsProp ?? fetchedSlots ?? []

  if (!slotsProp && !fetchedSlots) {
    return <Skeleton className="h-24 w-full" />
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-text-secondary">Time slots</h3>
      <div className="flex flex-wrap gap-2">
        {slots.map(slot => (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSlotClick?.(slot)}
            disabled={slot.status !== "available"}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors",
              slot.status === "available"
                ? "cursor-pointer border-accent/50 bg-accent/5 hover:bg-accent/10"
                : "cursor-not-allowed border-border bg-surface opacity-75",
            )}
          >
            <span className="font-mono tabular-nums">
              {format(new Date(slot.start_time), "HH:mm")}–{format(new Date(slot.end_time), "HH:mm")}
            </span>
            <Badge variant={statusVariant[slot.status]} className="ml-2 text-xs">
              {slot.status}
            </Badge>
          </button>
        ))}
      </div>
      {slots.length === 0 && (
        <p className="text-sm text-text-muted">No slots configured</p>
      )}
    </div>
  )
}
