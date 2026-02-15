"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PushupTracker } from "@/components/pushup-tracker"
import { Loader2 } from "lucide-react"

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    workouts: any[]
    allWorkouts: any[]
    totals: Record<string, number>
    workoutCounts: Record<string, number>
    username: string
    exerciseTypes: ExerciseType[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      console.log("[v0] Dashboard loading started")
      try {
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error("[v0] Supabase environment variables not configured")
          setError("App not configured. Please check environment variables.")
          setIsLoading(false)
          return
        }

        const supabase = createClient()
        console.log("[v0] Supabase client created")

        const {
          data: { user },
        } = await supabase.auth.getUser()
        console.log("[v0] User fetched:", user?.id)

        if (!user) {
          console.log("[v0] No user found, redirecting to login")
          window.location.href = "/auth/login"
          return
        }

        console.log("[v0] Fetching dashboard data...")
        const [profileResult, recentWorkoutsResult, allWorkoutsResult, exerciseTypesResult] = await Promise.all([
          supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
          supabase
            .from("workouts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("workouts")
            .select("id, value, exercise_type, created_at, is_quest_reward")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase.from("exercise_types").select("*").order("created_at", { ascending: true }),
        ])

        console.log("[v0] Data fetched, processing...")
        const { data: recentWorkouts, error: workoutsError } = recentWorkoutsResult
        const { data: allWorkouts, error: allWorkoutsError } = allWorkoutsResult
        const { data: exerciseTypes, error: exerciseTypesError } = exerciseTypesResult

        if (workoutsError) {
          console.error("[v0] Workouts error:", workoutsError)
          throw workoutsError
        }
        if (allWorkoutsError) {
          console.error("[v0] All workouts error:", allWorkoutsError)
          throw allWorkoutsError
        }
        if (exerciseTypesError) {
          console.error("[v0] Exercise types error:", exerciseTypesError)
          throw exerciseTypesError
        }

        const totals: Record<string, number> = {}
        const workoutCounts: Record<string, number> = {}
        exerciseTypes?.forEach((type) => {
          totals[type.id] = 0
          workoutCounts[type.id] = 0
        })

        allWorkouts?.forEach((w) => {
          const type = w.exercise_type || "pushups"
          if (totals[type] !== undefined) {
            // All workouts contribute to XP total
            totals[type] += w.value
            // Only non-quest workouts count as actual workout sessions
            if (!w.is_quest_reward) {
              workoutCounts[type] += 1
            }
          }
        })

        console.log("[v0] Setting dashboard data...")
        setData({
          workouts: recentWorkouts || [],
          allWorkouts: allWorkouts || [],
          totals,
          workoutCounts,
          username: profileResult.data?.username || user.email || "",
          exerciseTypes: exerciseTypes || [],
        })
        console.log("[v0] Dashboard data set successfully")
      } catch (err) {
        console.error("[v0] Error loading dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        console.log("[v0] Dashboard loading complete")
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

  return (
    <PushupTracker
      initialWorkouts={data.workouts}
      initialTotals={data.totals}
      initialWorkoutCounts={data.workoutCounts}
      username={data.username}
      exerciseTypes={data.exerciseTypes}
      allWorkouts={data.allWorkouts}
    />
  )
}
