"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, isSameDay } from "date-fns"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import type { Station, Slot } from "@/types"
import { Button } from "@/components/ui/Button"
import { useBooking } from "@/hooks/useBooking"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface BookingModalProps {
  station: Station
  slots: Slot[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 1 | 2 | 3

export function BookingModal({
  station,
  slots,
  open,
  onOpenChange,
}: BookingModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  const { createCheckout } = useBooking()
  const supabase = createClient()

  const availableSlots = slots.filter(
    (s) =>
      s.status === "available" &&
      isSameDay(new Date(s.start_time), selectedDate),
  )

  const handleCheckout = async () => {
    if (!selectedSlot) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    const amountCents = Math.ceil(
      ((new Date(selectedSlot.end_time).getTime() -
        new Date(selectedSlot.start_time).getTime()) /
        (1000 * 60 * 60)) *
        station.power_kw *
        station.price_per_kwh *
        100,
    )
    try {
      const url = await createCheckout.mutateAsync({
        slotId: selectedSlot.id,
        stationId: station.id,
        driverId: user.id,
        amountCents,
      })
      if (url) {
        router.push(url)
        onOpenChange(false)
      }
    } catch {
      // Error handled by mutation
    }
  }

  const priceEstimate =
    selectedSlot && station
      ? Math.ceil(
          ((new Date(selectedSlot.end_time).getTime() -
            new Date(selectedSlot.start_time).getTime()) /
            (1000 * 60 * 60)) *
            station.power_kw *
            station.price_per_kwh *
            100,
        )
      : 0

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          aria-describedby="booking-modal-description"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Book Charging Slot</h2>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded p-1 hover:bg-surface-2"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 mb-6 h-1 w-full rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">Select date</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map((date) => (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "shrink-0 rounded-lg border px-4 py-2 text-sm transition-colors",
                      isSameDay(date, selectedDate)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:border-accent/50",
                    )}
                  >
                    {format(date, "EEE M/d")}
                  </button>
                ))}
              </div>
              <p className="text-sm text-text-muted">Select time slot</p>
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot)
                      setStep(2)
                    }}
                    className="rounded-lg border border-border p-3 text-left transition-colors hover:border-accent/50"
                  >
                    <span className="font-medium">
                      {format(new Date(slot.start_time), "h:mm a")} -{" "}
                      {format(new Date(slot.end_time), "h:mm a")}
                    </span>
                  </button>
                ))}
              </div>
              {availableSlots.length === 0 && (
                <p className="text-sm text-text-muted">
                  No available slots for this date.
                </p>
              )}
            </div>
          )}

          {step === 2 && selectedSlot && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-surface-2 p-4">
                <h3 className="font-medium">{station.name}</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {format(new Date(selectedSlot.start_time), "EEE, MMM d")} •{" "}
                  {format(new Date(selectedSlot.start_time), "h:mm a")} -{" "}
                  {format(new Date(selectedSlot.end_time), "h:mm a")}
                </p>
                <p className="mt-2 font-mono text-accent tabular-nums">
                  ~${(priceEstimate / 100).toFixed(2)} estimated
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                >
                  Continue to payment
                </Button>
              </div>
            </div>
          )}

          {step === 3 && selectedSlot && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-surface-2 p-4">
                <p className="text-sm text-text-muted">Total</p>
                <p className="font-mono text-2xl tabular-nums text-accent">
                  ${(priceEstimate / 100).toFixed(2)}
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={createCheckout.isPending}
              >
                {createCheckout.isPending ? "Processing..." : "Pay with Stripe"}
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
