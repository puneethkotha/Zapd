"use client"

import { useState } from "react"
import Link from "next/link"
import type { Station, Slot } from "@/types"
import { StationDetail } from "@/components/station/StationDetail"
import { BookingModal } from "@/components/station/BookingModal"
import { Button } from "@/components/ui/Button"

interface StationDetailClientProps {
  station: Station
  slots: Slot[]
}

export function StationDetailClient({ station, slots }: StationDetailClientProps) {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">← Back to map</Link>
        </Button>
      </div>
      <StationDetail
        station={station}
        slots={slots}
        onBookClick={() => setBookingOpen(true)}
      />
      <BookingModal
        station={station}
        slots={slots}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </>
  )
}
