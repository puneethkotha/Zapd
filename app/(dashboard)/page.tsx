"use client"

import { Suspense, useState } from "react"
import { motion } from "framer-motion"
import { MapView } from "@/components/map/MapView"
import { StationCard } from "@/components/station/StationCard"
import { useNearbyStations } from "@/hooks/useNearbyStations"
import { Skeleton } from "@/components/ui/Skeleton"

function StationListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  )
}

function SearchBar() {
  const [connectorFilter, setConnectorFilter] = useState<string>("all")

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute left-1/2 top-4 z-10 w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
    >
      <div className="rounded-xl border border-border/50 bg-black/40 p-2 backdrop-blur-md">
        <div className="flex flex-wrap gap-2">
          {["all", "CCS2", "CHAdeMO", "J1772"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setConnectorFilter(type)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                connectorFilter === type
                  ? "bg-accent text-background"
                  : "bg-white/5 text-text-secondary hover:bg-white/10"
              }`}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data: stations, isLoading } = useNearbyStations()

  return (
    <div className="relative h-[calc(100vh-64px)] w-full">
      <MapView stations={stations ?? []} />
      <SearchBar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 z-10 max-h-[45vh] overflow-hidden rounded-t-2xl border-t border-border bg-surface/95 backdrop-blur-xl md:left-auto md:right-4 md:top-1/2 md:bottom-auto md:max-h-[calc(100%-8rem)] md:w-96 md:-translate-y-1/2 md:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-border-subtle p-4">
          <h2 className="text-lg font-semibold">Nearby Stations</h2>
          <span className="text-sm text-text-muted">
            {stations?.length ?? 0} available
          </span>
        </div>
        <div className="max-h-[35vh] overflow-y-auto md:max-h-[calc(100%-5rem)]">
          <Suspense fallback={<StationListSkeleton />}>
            {isLoading ? (
              <StationListSkeleton />
            ) : (
              <div className="space-y-3 p-4">
                {stations?.map((station, i) => (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <StationCard station={station} />
                  </motion.div>
                ))}
                {(!stations || stations.length === 0) && !isLoading && (
                  <p className="py-8 text-center text-text-muted">
                    No stations found nearby
                  </p>
                )}
              </div>
            )}
          </Suspense>
        </div>
      </motion.div>
    </div>
  )
}
