"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  MapPin,
  Calendar,
  Zap,
  User,
  Settings,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Map", icon: MapPin },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/host", label: "Host", icon: Zap },
  { href: "/profile", label: "Profile", icon: User },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap className="size-4 text-accent" />
          </div>
          <span className="font-semibold text-text-primary">ZAPD</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn("size-5 shrink-0", isActive && "text-accent")}
              />
              {item.label}
              {isActive && (
                <ChevronRight className="ml-auto size-4 text-accent" />
              )}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border-subtle p-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <Settings className="size-5 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
