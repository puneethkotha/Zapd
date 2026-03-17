"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createStationSchema, type CreateStationInput } from "@/lib/validations/station"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

interface StationFormProps {
  onSubmit: (data: CreateStationInput) => Promise<void>
  isLoading?: boolean
}

const STEPS = ["Location", "Hardware", "Photos"]
const CONNECTOR_OPTIONS = ["CCS2", "CHAdeMO", "J1772"]
const AMENITY_OPTIONS = ["wifi", "restroom", "coffee", "shelter", "security"]

export function StationForm({ onSubmit, isLoading }: StationFormProps) {
  const [step, setStep] = useState(0)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateStationInput>({
    resolver: zodResolver(createStationSchema),
    defaultValues: {
      connector_types: [],
      amenities: [],
      photos: [],
    },
  })

  const connectorTypes = watch("connector_types") ?? []
  const amenities = watch("amenities") ?? []

  const toggleConnector = (c: string) => {
    const next = connectorTypes.includes(c)
      ? connectorTypes.filter((x) => x !== c)
      : [...connectorTypes, c]
    setValue("connector_types", next)
  }

  const toggleAmenity = (a: string) => {
    const next = amenities.includes(a)
      ? amenities.filter((x) => x !== a)
      : [...amenities, a]
    setValue("amenities", next)
  }

  const onStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 2) {
      setStep((s) => s + 1)
    }
    else {
      await handleSubmit(onSubmit)(e)
    }
  }

  return (
    <form onSubmit={onStepSubmit}>
      <div className="mb-6 flex gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "h-1 flex-1 rounded-full",
              i <= step ? "bg-accent" : "bg-surface-2",
            )}
            aria-hidden
          />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <Input
            label="Address"
            placeholder="Enter address or search"
            {...register("address")}
            error={errors.address?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" {...register("city")} error={errors.city?.message} />
            <Input label="State" {...register("state")} error={errors.state?.message} />
            <Input label="ZIP" {...register("zip")} error={errors.zip?.message} />
          </div>
          <Input
            label="Latitude"
            type="number"
            step="any"
            {...register("latitude", { valueAsNumber: true })}
            error={errors.latitude?.message}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            {...register("longitude", { valueAsNumber: true })}
            error={errors.longitude?.message}
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Input label="Station name" {...register("name")} error={errors.name?.message} />
          <Input
            label="Description"
            {...register("description")}
            error={errors.description?.message}
          />
          <div>
            <p className="mb-2 text-sm text-text-secondary">Connector types</p>
            <div className="flex flex-wrap gap-2">
              {CONNECTOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleConnector(c)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm transition-colors",
                    connectorTypes.includes(c)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-surface hover:border-accent/50",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Power (kW)"
            type="number"
            step="0.1"
            {...register("power_kw", { valueAsNumber: true })}
            error={errors.power_kw?.message}
          />
          <Input
            label="Price per kWh"
            type="number"
            step="0.0001"
            {...register("price_per_kwh", { valueAsNumber: true })}
            error={errors.price_per_kwh?.message}
          />
          <div>
            <p className="mb-2 text-sm text-text-secondary">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm capitalize transition-colors",
                    amenities.includes(a)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-surface hover:border-accent/50",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="p-6">
          <p className="text-text-secondary">
            Photo upload via Uploadthing — add UPLOADTHING_TOKEN to use. You can add up to 6 photos.
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Configure Uploadthing at /api/uploadthing and use the UploadButton component.
          </p>
        </Card>
      )}

      <div className="mt-8 flex gap-4">
        {step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep(s => s - 1)}>
            Back
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {step < 2 ? "Next" : "Create Station"}
        </Button>
      </div>
    </form>
  )
}
