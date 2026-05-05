"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ActivityFeed } from "@/components/activity-feed"
import { useActivities } from "@/hooks/use-activities"
import { Button } from "@/components/ui/button"
import { Loader2, Zap, ArrowLeft, Bell, TrendingUp, Trophy, Flame } from "lucide-react"
import Link from "next/link"

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
}

interface Workout {
  id: string
  value: number
  created_at: string
  exercise_type?: string
  is_quest_reward?: boolean
}

export default function ActivityPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [totals, setTotals] = useState<Record<string, number>>({})
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

        const [workoutsResult, exerciseTypesResult] = await Promise.all([
          supabase
            .from("workouts")
            .select("id, value, exercise_type, created_at, is_quest_reward")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase.from("exercise_types").select("*").order("created_at", { ascending: true }),
        ])

        if (workoutsResult.error) throw workoutsResult.error
        if (exerciseTypesResult.error) throw exerciseTypesResult.error

        const exerciseTypesData = exerciseTypesResult.data || []
        const workoutsData = workoutsResult.data || []

        // Calculate totals
        const calculatedTotals: Record<string, number> = {}
        exerciseTypesData.forEach((type) => {
          calculatedTotals[type.id] = 0
        })
        workoutsData.forEach((w) => {
          const type = w.exercise_type || "pushups"
          if (calculatedTotals[type] !== undefined) {
            calculatedTotals[type] += w.value
          }
        })

        setWorkouts(workoutsData)
        setExerciseTypes(exerciseTypesData)
        setTotals(calculatedTotals)
      } catch (err) {
        console.error("Error loading activity data:", err)
        setError("Failed to load activity data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const { activities, markAsRead, markAllAsRead, unreadCount } = useActivities({
    workouts,
    exerciseTypes,
    totals,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your activity...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="text-primary hover:underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Calculate stats for the hero section
  const totalWorkouts = workouts.filter((w) => !w.is_quest_reward).length
  const highPriorityActivities = activities.filter((a) => a.priority === "high").length
  const recentAchievements = activities.filter(
    (a) =>
      ["level_up", "milestone", "tier_promotion", "personal_record"].includes(a.type) &&
      a.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Activity</h1>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-gradient-to-br from-card to-primary/5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-card to-accent/5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{recentAchievements}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-card to-orange-500/5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{highPriorityActivities}</p>
                <p className="text-xs text-muted-foreground">Highlights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <ActivityFeed
          activities={activities}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllAsRead}
          title="Your Activity"
          maxHeight="calc(100vh - 320px)"
        />
      </div>
    </main>
  )
}
