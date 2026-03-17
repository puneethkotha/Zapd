import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { StationDetailClient } from "./StationDetailClient"

export default async function StationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: station, error } = await supabase
    .from("stations")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !station) notFound()

  const { data: slots } = await supabase
    .from("slots")
    .select("*")
    .eq("station_id", id)
    .gte("end_time", new Date().toISOString())
    .order("start_time")

  return (
    <div className="min-h-screen p-6">
      <StationDetailClient station={station} slots={slots ?? []} />
    </div>
  )
}
