"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Zap, Battery } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { useRealtimeSession } from "@/hooks/useRealtimeSession"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface LiveSessionCardProps {
  bookingId: string
  startedAt: string
  onStopCharging?: () => void
  className?: string
}

export function LiveSessionCard({
  bookingId,
  startedAt,
  onStopCharging,
  className,
}: LiveSessionCardProps) {
  const session = useRealtimeSession(bookingId)
  const reducedMotion = useReducedMotion()
  const progress = session.batteryPercent ?? 0

  return (
    <Card className={cn("glow-accent overflow-hidden", className)}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <Zap className="h-6 w-6 text-accent" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Charging in progress
              </h2>
              <p className="text-sm text-text-muted">
                Started {formatDistanceToNow(new Date(startedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-2xl tabular-nums text-accent">
            {session.currentKw.toFixed(1)}
            <span className="text-sm text-text-muted"> kW</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Battery level</span>
            <span className="font-mono tabular-nums text-text-primary">
              {progress}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-green"
              initial={reducedMotion ? false : { width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted">kWh delivered</p>
            <p className="font-mono text-xl tabular-nums text-text-primary">
              {session.kwhDelivered.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Elapsed</p>
            <p className="font-mono text-xl tabular-nums text-text-primary">
              {Math.floor(session.elapsedSeconds / 60)}m {session.elapsedSeconds % 60}s
            </p>
          </div>
        </div>

        {onStopCharging && (
          <button
            type="button"
            onClick={onStopCharging}
            className="mt-2 w-full rounded-lg border border-accent-red/50 bg-accent-red/10 px-4 py-2.5 text-sm font-medium text-accent-red transition-colors hover:bg-accent-red/20"
            aria-label="Stop charging"
          >
            Stop Charging
          </button>
        )}
      </div>
    </Card>
  )
}
