"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Station } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { SlotManager } from "@/components/host/SlotManager"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function HostStationDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const { data: station, isLoading } = useQuery({
    queryKey: ["station", params.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stations")
        .select("*")
        .eq("id", params.id)
        .single()
      if (error) throw error
      return data as Station
    },
  })

  if (isLoading || !station) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/host/stations">
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">{station.name}</h1>
      </div>
      <Card className="p-6">
        <h2 className="mb-4 font-medium">Manage Slots</h2>
        <SlotManager stationId={station.id} />
      </Card>
    </div>
  )
}
