"use client"

import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "bg-surface border border-border rounded-lg",
          title: "text-text-primary",
          description: "text-text-secondary",
        },
      }}
    />
  )
}
