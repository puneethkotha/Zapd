"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import type { Slot } from "@/types"
import { cn } from "@/lib/utils"

interface SessionTimelineProps {
  slots: Slot[]
  date: Date
  onSlotSelect?: (slot: Slot) => void
  selectedSlotId?: string | null
  className?: string
}

export function SessionTimeline({
  slots,
  date,
  onSlotSelect,
  selectedSlotId,
  className,
}: SessionTimelineProps) {
  const daySlots = slots.filter(
    (s) =>
      s.start_time.startsWith(date.toISOString().slice(0, 10)) &&
      s.status !== "completed",
  )

  if (daySlots.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-text-muted">
        No slots available for {format(date, "MMM d, yyyy")}
      </p>
    )
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="flex gap-2 pb-2">
        {daySlots.map((slot) => {
          const isAvailable = slot.status === "available"
          const isCharging = slot.status === "charging"
          const isSelected = selectedSlotId === slot.id

          return (
            <motion.button
              key={slot.id}
              type="button"
              onClick={() => isAvailable && onSlotSelect?.(slot)}
              disabled={!isAvailable}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={isAvailable ? { scale: 1.02 } : undefined}
              className={cn(
                "shrink-0 rounded-lg border px-4 py-2.5 text-sm font-mono tabular-nums transition-colors",
                isAvailable &&
                  "cursor-pointer border-accent/50 bg-accent/10 text-accent hover:bg-accent/20",
                !isAvailable && "cursor-not-allowed border-border bg-surface-2 text-text-muted",
                isCharging && "border-accent-amber/50 bg-accent-amber/10",
                isSelected && "ring-2 ring-accent ring-offset-2 ring-offset-background",
              )}
              aria-pressed={isSelected}
              aria-disabled={!isAvailable}
            >
              {format(new Date(slot.start_time), "h:mm a")}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
