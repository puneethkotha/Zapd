export type UserRole = "driver" | "host" | "admin"

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  stripe_customer_id: string | null
  created_at: string
}

export type StationStatus = "active" | "inactive" | "maintenance"

export interface Station {
  id: string
  host_id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  connector_types: string[]
  power_kw: number
  price_per_kwh: number
  amenities: string[]
  photos: string[]
  status: StationStatus
  avg_rating: number | null
  total_reviews: number
  created_at: string
}

export type SlotStatus = "available" | "booked" | "charging" | "completed"

export interface Slot {
  id: string
  station_id: string
  start_time: string
  end_time: string
  status: SlotStatus
  created_at: string
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "refunded"

export interface Booking {
  id: string
  driver_id: string
  slot_id: string
  station_id: string
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  amount_cents: number
  kwh_delivered: number | null
  status: BookingStatus
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  driver_id: string
  station_id: string
  rating: number
  comment: string | null
  created_at: string
}

export type ChargingSessionStatus =
  | "initializing"
  | "charging"
  | "paused"
  | "completed"
  | "error"

export interface ChargingSession {
  id: string
  booking_id: string
  current_kw: number
  kwh_delivered: number
  battery_percent: number
  status: ChargingSessionStatus
  updated_at: string
}

export interface StationWithDetails extends Station {
  host?: Profile
  slots?: Slot[]
  reviews?: (Review & { driver?: Profile })[]
}

export interface BookingWithDetails extends Booking {
  slot?: Slot
  station?: Station
  driver?: Profile
  charging_session?: ChargingSession
}
