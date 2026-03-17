"use client"

import { forwardRef, type HTMLAttributes } from "react"
import { tv } from "tailwind-variants"
import { cn } from "@/lib/utils"

const badgeVariants = tv({
  base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  variants: {
    variant: {
      default: "border-border bg-surface-2 text-text-primary",
      secondary: "border-border-subtle bg-surface text-text-secondary",
      accent: "border-accent/50 bg-accent/10 text-accent",
      success: "border-accent-green/50 bg-accent-green/10 text-accent-green",
      warning: "border-accent-amber/50 bg-accent-amber/10 text-accent-amber",
      error: "border-accent-red/50 bg-accent-red/10 text-accent-red",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    Partial<{ variant: keyof typeof badgeVariants.variants.variant }> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  ),
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
