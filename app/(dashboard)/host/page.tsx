"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useHostStats } from "@/hooks/useHostStats"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { EarningsChart } from "@/components/host/EarningsChart"
import { DollarSign, Zap, Star, Activity } from "lucide-react"

export default function HostDashboardPage() {
  const supabase = createClient()
  const { data: authData } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      return data
    },
  })
  const user = authData?.user
  const { data: stats, isLoading } = useHostStats(user?.id ?? null)

  const { data: stations } = useQuery({
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
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const statCards = [
    {
      label: "Total Earnings",
      value: `$${(stats?.totalEarnings ?? 0).toFixed(2)}`,
      icon: DollarSign,
    },
    {
      label: "Active Sessions",
      value: stats?.activeSessions ?? 0,
      icon: Activity,
    },
    {
      label: "Total kWh",
      value: (stats?.totalKwh ?? 0).toFixed(1),
      icon: Zap,
    },
    {
      label: "Avg Rating",
      value: (stats?.avgRating ?? 0).toFixed(1),
      icon: Star,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Host Dashboard</h1>
        <Button asChild>
          <Link href="/host/stations/new">Add Station</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <stat.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="font-mono text-xl font-semibold tabular-nums text-text-primary">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-medium text-text-primary">Earnings (30 days)</h2>
        <div className="mt-4 h-64">
          <EarningsChart
            data={(stats?.earningsByDay ?? []).map((d) => ({
              date: d.date,
              earnings: d.amount,
            }))}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-text-primary">Your Stations</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/host/stations">View All</Link>
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {stations?.slice(0, 5).map(station => (
            <Link
              key={station.id}
              href={`/host/stations/${station.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:border-accent/50"
            >
              <div>
                <p className="font-medium">{station.name}</p>
                <p className="text-sm text-text-muted">{station.status}</p>
              </div>
              <span className="font-mono text-accent">
                ${station.price_per_kwh.toFixed(2)}/kWh
              </span>
            </Link>
          ))}
          {(!stations || stations.length === 0) && (
            <p className="py-8 text-center text-text-muted">No stations yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
