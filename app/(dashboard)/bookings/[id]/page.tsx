"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { BookingWithDetails } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { Badge } from "@/components/ui/Badge"
import { LiveSessionCard } from "@/components/session/LiveSessionCard"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const supabase = createClient()

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          slot:slots(*),
          station:stations(*)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data as BookingWithDetails
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Booking not found</p>
        <Button asChild className="mt-4">
          <Link href="/bookings">Back to Bookings</Link>
        </Button>
      </div>
    )
  }

  const isActive = booking.status === "active"

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/bookings" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {booking.station?.name ?? "Charging Session"}
          </h1>
          <p className="mt-1 text-text-muted">
            {booking.slot?.start_time
              ? format(new Date(booking.slot.start_time), "PPP 'at' p")
              : "—"}
          </p>
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
            className="mt-2"
          >
            {booking.status}
          </Badge>
        </div>
        <span className="font-mono text-xl tabular-nums text-accent">
          ${(booking.amount_cents / 100).toFixed(2)}
        </span>
      </div>

      {isActive && (
        <LiveSessionCard
          bookingId={booking.id}
          startedAt={booking.started_at ?? booking.created_at}
        />
      )}

      <Card className="p-6">
        <h2 className="text-lg font-medium text-text-primary">Booking Details</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-text-muted">Station</dt>
            <dd className="font-medium">{booking.station?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Address</dt>
            <dd className="font-medium">{booking.station?.address ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">Time Slot</dt>
            <dd className="font-medium">
              {booking.slot?.start_time && booking.slot?.end_time
                ? `${format(new Date(booking.slot.start_time), "p")} – ${format(new Date(booking.slot.end_time), "p")}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-text-muted">kWh Delivered</dt>
            <dd className="font-mono tabular-nums">{booking.kwh_delivered ?? "—"}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
