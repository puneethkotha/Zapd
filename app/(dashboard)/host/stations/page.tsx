"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Station } from "@/types"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { Badge } from "@/components/ui/Badge"
import { Plus, MapPin } from "lucide-react"

export default function HostStationsPage() {
  const supabase = createClient()

  const { data: stations, isLoading } = useQuery({
    queryKey: ["host-stations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from("stations")
        .select("*")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data ?? []
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
        <h1 className="text-2xl font-semibold text-text-primary">My Stations</h1>
        <Button asChild>
          <Link href="/host/stations/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Station
          </Link>
        </Button>
      </div>

      {!stations?.length ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <MapPin className="h-12 w-12 text-text-muted" />
          <p className="mt-4 text-text-secondary">No stations yet</p>
          <p className="mt-1 text-sm text-text-muted">
            List your charger and start earning
          </p>
          <Button asChild className="mt-6">
            <Link href="/host/stations/new">Add Your First Station</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {stations.map((station: Station) => (
            <Link key={station.id} href={`/host/stations/${station.id}`}>
              <Card className="flex items-center justify-between p-4 transition-colors hover:border-accent/50">
                <div>
                  <h3 className="font-medium text-text-primary">{station.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                    <MapPin className="h-3.5 w-3.5" />
                    {station.address ?? station.city ?? "—"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge
                      variant={
                        station.status === "active"
                          ? "success"
                          : station.status === "maintenance"
                            ? "warning"
                            : "default"
                      }
                    >
                      {station.status}
                    </Badge>
                    <span className="text-sm text-text-muted">
                      {station.total_reviews} reviews
                    </span>
                  </div>
                </div>
                <span className="font-mono tabular-nums text-accent">
                  ${station.price_per_kwh.toFixed(2)}/kWh
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
