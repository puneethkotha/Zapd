import { z } from "zod"

export const createBookingSchema = z.object({
  slot_id: z.string().uuid(),
  station_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
})

export const slotSelectionSchema = z.object({
  slot_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type SlotSelectionInput = z.infer<typeof slotSelectionSchema>
