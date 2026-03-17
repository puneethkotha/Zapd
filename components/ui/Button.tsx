"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { Slot } from "@radix-ui/react-slot"
import { tv } from "tailwind-variants"
import { cn } from "@/lib/utils"

const buttonVariants = tv({
  base: "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  variants: {
    variant: {
      primary:
        "bg-accent text-background hover:bg-accent/90 active:scale-[0.98] glow-accent",
      secondary:
        "bg-surface border border-border hover:border-accent/50 hover:bg-surface-2",
      outline: "border border-border bg-transparent hover:bg-surface-2",
      ghost: "hover:bg-surface-2",
      destructive: "bg-accent-red text-white hover:bg-accent-red/90",
      link: "text-accent underline-offset-4 hover:underline",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "size-10",
      "icon-sm": "size-8",
      "icon-lg": "size-12",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg"
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants }
