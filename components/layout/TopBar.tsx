"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/Button"
import * as Avatar from "@radix-ui/react-avatar"

interface TopBarProps {
  user?: { full_name?: string | null; avatar_url?: string | null } | null
}

export function TopBar({ user }: TopBarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-text-primary">
          EV Charging
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        {user ? (
          <Avatar.Root className="flex size-9 rounded-full overflow-hidden bg-surface-2 border border-border">
            <Avatar.Image
              src={user.avatar_url ?? undefined}
              alt={user.full_name ?? "User"}
            />
            <Avatar.Fallback className="flex size-full items-center justify-center bg-accent/20 text-accent text-sm font-medium">
              {(user.full_name ?? "U").slice(0, 1).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
        ) : null}
      </div>
    </header>
  )
}
