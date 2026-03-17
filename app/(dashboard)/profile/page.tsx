"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Skeleton } from "@/components/ui/Skeleton"
import { User } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const { data: authData } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      return data
    },
  })
  const user = authData?.user

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (!user && !profile && !isLoading) {
      router.push("/login")
    }
  }, [user, profile, isLoading, router])

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 rounded-full border-2 border-border">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="flex size-16 items-center justify-center rounded-full bg-surface-2 text-2xl text-text-muted">
              <User className="size-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-medium">
              {profile?.full_name ?? user.email ?? "User"}
            </h2>
            <p className="text-sm text-text-muted">{user.email}</p>
            <p className="mt-1 text-xs text-text-muted capitalize">
              Role: {profile?.role ?? "driver"}
            </p>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="mb-4 font-medium">Account</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              Email
            </label>
            <Input
              type="email"
              value={user.email ?? ""}
              disabled
              className="bg-surface"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
