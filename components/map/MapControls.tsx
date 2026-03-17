"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { Locate, ZoomIn, ZoomOut } from "lucide-react"

interface MapControlsProps {
  onLocate?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  isLocating?: boolean
}

export function MapControls({
  onLocate,
  onZoomIn,
  onZoomOut,
  isLocating = false,
}: MapControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute bottom-24 right-4 flex flex-col gap-2 md:bottom-6"
    >
      <ControlButton
        onClick={onLocate}
        aria-label="Center on my location"
        disabled={isLocating}
      >
        <Locate className={`h-5 w-5 ${isLocating ? "animate-pulse" : ""}`} />
      </ControlButton>
      <ControlButton onClick={onZoomIn} aria-label="Zoom in">
        <ZoomIn className="h-5 w-5" />
      </ControlButton>
      <ControlButton onClick={onZoomOut} aria-label="Zoom out">
        <ZoomOut className="h-5 w-5" />
      </ControlButton>
    </motion.div>
  )
}

function ControlButton({
  children,
  onClick,
  "aria-label": ariaLabel,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  "aria-label": string
  disabled?: boolean
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface/90 backdrop-blur-md transition-colors hover:bg-surface-2 disabled:opacity-50"
    >
      {children}
    </motion.button>
  )
}
