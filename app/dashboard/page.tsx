"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PushupTracker } from "@/components/pushup-tracker"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    workouts: any[]
    totals: { pushups: number; pullups: number; squats: number }
    username: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = "/auth/login"
          return
        }

        const [profileResult, recentWorkoutsResult, totalsResult] = await Promise.all([
          supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
          supabase
            .from("workouts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
          supabase.from("workouts").select("pushups, exercise_type").eq("user_id", user.id),
        ])

        const { data: recentWorkouts, error: workoutsError } = recentWorkoutsResult
        const { data: allWorkouts, error: totalsError } = totalsResult

        if (workoutsError) throw workoutsError
        if (totalsError) throw totalsError

        const totals = {
          pushups: 0,
          pullups: 0,
          squats: 0,
        }

        allWorkouts?.forEach((w) => {
          const type = w.exercise_type || "pushups"
          totals[type as keyof typeof totals] += w.pushups
        })

        setData({
          workouts: recentWorkouts || [],
          totals,
          username: profileResult.data?.username || user.email || "",
        })
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Failed to load data"}</p>
          <button onClick={() => window.location.reload()} className="text-primary hover:underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return <PushupTracker initialWorkouts={data.workouts} initialTotals={data.totals} username={data.username} />
}
