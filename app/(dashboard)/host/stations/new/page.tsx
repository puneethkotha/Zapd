"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { CreateStationInput } from "@/lib/validations/station"
import { StationForm } from "@/components/host/StationForm"

export default function NewStationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (data: CreateStationInput) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("stations").insert({
        host_id: user.id,
        name: data.name,
        description: data.description ?? null,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        zip: data.zip ?? null,
        connector_types: data.connector_types,
        power_kw: data.power_kw,
        price_per_kwh: data.price_per_kwh,
        amenities: data.amenities ?? [],
        photos: data.photos ?? [],
        status: "active",
      })

      if (error) throw error
      router.push("/host/stations")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Add New Station</h1>
        <p className="mt-1 text-text-secondary">
          List your charger and start earning from EV drivers
        </p>
      </div>
      <StationForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
