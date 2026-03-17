"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { BookingWithDetails } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { Badge } from "@/components/ui/Badge"
import { format } from "date-fns"

export default function BookingsPage() {
  const supabase = createClient()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          slot:slots(*),
          station:stations(*)
        `)
        .eq("driver_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data ?? []) as BookingWithDetails[]
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Booking History</h1>
      </div>

      {!bookings?.length ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="h-12 w-12 text-text-muted" />
          <p className="mt-4 text-text-secondary">No bookings yet</p>
          <p className="mt-1 text-sm text-text-muted">
            Find a station and book your first charging session
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Find Stations</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/bookings/${booking.id}`}>
                <Card className="flex items-center justify-between p-4 transition-colors hover:border-accent/50">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary">
                      {booking.station?.name ?? "Station"}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      {booking.slot?.start_time
                        ? format(new Date(booking.slot.start_time), "PPP 'at' p")
                        : "—"}
                    </p>
                    <div className="mt-2">
                      <Badge
                        variant={
                          booking.status === "completed"
                            ? "success"
                            : booking.status === "active"
                              ? "accent"
                              : booking.status === "cancelled"
                                ? "error"
                                : "default"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-4 shrink-0">
                    <span className="font-mono tabular-nums text-accent">
                      ${((booking.amount_cents ?? 0) / 100).toFixed(2)}
                    </span>
                    <ChevronRight className="ml-2 inline-block h-5 w-5 text-text-muted" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
