"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Calendar, Zap, User, X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "framer-motion"

const navItems = [
  { href: "/", label: "Map", icon: MapPin },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/host", label: "Host", icon: Zap },
  { href: "/profile", label: "Profile", icon: User },
] as const

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 size-14 rounded-full bg-accent text-background shadow-lg shadow-accent/25 flex items-center justify-center"
        aria-label="Open navigation"
      >
        <Menu className="size-6" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: reducedMotion ? false : "spring",
                damping: 25,
                stiffness: 200,
              }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-surface border-l border-border lg:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex h-16 items-center justify-between px-4 border-b border-border">
                <span className="font-semibold text-text-primary">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 -m-2 text-text-secondary hover:text-text-primary"
                  aria-label="Close navigation"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="size-5 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
