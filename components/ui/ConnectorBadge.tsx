"use client"

import { Zap, Plug, Battery } from "lucide-react"
import { Badge } from "./Badge"
import { cn } from "@/lib/utils"

const CONNECTOR_CONFIG: Record<
  string,
  { label: string; icon: typeof Zap; className?: string }
> = {
  CCS2: {
    label: "CCS2",
    icon: Zap,
    className: "text-accent",
  },
  CHAdeMO: {
    label: "CHAdeMO",
    icon: Battery,
    className: "text-accent-amber",
  },
  J1772: {
    label: "J1772",
    icon: Plug,
    className: "text-accent-green",
  },
}

export function ConnectorBadge({
  type,
  className,
}: {
  type: string
  className?: string
}) {
  const config = CONNECTOR_CONFIG[type] ?? {
    label: type,
    icon: Zap,
    className: "text-text-secondary",
  }

  const Icon = config.icon

  return (
    <Badge
      variant="accent"
      className={cn(
        "gap-1 font-mono text-xs tabular-nums",
        config.className,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {config.label}
    </Badge>
  )
}
