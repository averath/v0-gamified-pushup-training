"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, TrendingUp, Calendar, Flame, Target, Award, ArrowLeft, BarChart3, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getLevelProgress, getLevelTier, getTierIcon, MILESTONES, calculateLevel } from "@/lib/level-system"
import { ExerciseSelector } from "@/components/exercise-selector"
import { useSelectedExercise } from "@/hooks/use-selected-exercise"

interface Workout {
  id: string
  value: number
  created_at: string
  exercise_type: string
}

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
  measurement_type: string
}

interface DailyStats {
  date: string
  total: number
  count: number
}

interface WeeklyStats {
  week: string
  total: number
  count: number
}

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [username, setUsername] = useState("")
  const supabase = createClient()

  const [activeExercise, setActiveExercise] = useSelectedExercise(exerciseTypes)

  useEffect(() => {
    async function loadStats() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = "/auth/login"
          return
        }

        const [profileResult, workoutsResult, exerciseTypesResult] = await Promise.all([
          supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
          supabase.from("workouts").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
          supabase.from("exercise_types").select("*").order("created_at", { ascending: true }),
        ])

        setUsername(profileResult.data?.username || "")
        setWorkouts(workoutsResult.data || [])
        setExerciseTypes(exerciseTypesResult.data || [])
      } catch (err) {
        console.error("Error loading stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const currentExercise = exerciseTypes.find((e) => e.id === activeExercise)
  const filteredWorkouts = useMemo(
    () => workouts.filter((w) => (w.exercise_type || "pushups") === activeExercise),
    [workouts, activeExercise],
  )

  const stats = useMemo(() => {
    if (filteredWorkouts.length === 0) {
      return {
        totalXP: 0,
        totalWorkouts: 0,
        averagePerWorkout: 0,
        bestWorkout: 0,
        currentStreak: 0,
        longestStreak: 0,
        dailyStats: [] as DailyStats[],
        weeklyStats: [] as WeeklyStats[],
        firstWorkout: null as Date | null,
        lastWorkout: null as Date | null,
        daysActive: 0,
        milestonesReached: [] as number[],
        levelProgress: getLevelProgress(0),
      }
    }

    const totalXP = filteredWorkouts.reduce((sum, w) => sum + w.value, 0)
    const totalWorkouts = filteredWorkouts.length
    const averagePerWorkout = Math.round(totalXP / totalWorkouts)
    const bestWorkout = Math.max(...filteredWorkouts.map((w) => w.value))
    const firstWorkout = new Date(filteredWorkouts[0].created_at)
    const lastWorkout = new Date(filteredWorkouts[filteredWorkouts.length - 1].created_at)

    // Calculate daily stats
    const dailyMap = new Map<string, { total: number; count: number }>()
    filteredWorkouts.forEach((w) => {
      const date = new Date(w.created_at).toISOString().split("T")[0]
      const existing = dailyMap.get(date) || { total: 0, count: 0 }
      dailyMap.set(date, { total: existing.total + w.value, count: existing.count + 1 })
    })

    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate streaks
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const sortedDates = [...dailyMap.keys()].sort().reverse()

    // Check if active today or yesterday for current streak
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i])
        const expectedDate = new Date(sortedDates[0])
        expectedDate.setDate(expectedDate.getDate() - i)

        if (currentDate.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    const allDates = [...dailyMap.keys()].sort()
    for (let i = 0; i < allDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prev = new Date(allDates[i - 1])
        const curr = new Date(allDates[i])
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)

        if (diffDays === 1) {
          tempStreak++
        } else {
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    // Weekly stats (last 8 weeks)
    const weeklyMap = new Map<string, { total: number; count: number }>()
    filteredWorkouts.forEach((w) => {
      const date = new Date(w.created_at)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split("T")[0]
      const existing = weeklyMap.get(weekKey) || { total: 0, count: 0 }
      weeklyMap.set(weekKey, { total: existing.total + w.value, count: existing.count + 1 })
    })

    const weeklyStats = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => b.week.localeCompare(a.week))
      .slice(0, 8)
      .reverse()

    // Calculate milestones reached
    const milestonesReached = MILESTONES.filter((m) => calculateLevel(totalXP) >= m)

    return {
      totalXP,
      totalWorkouts,
      averagePerWorkout,
      bestWorkout,
      currentStreak,
      longestStreak,
      dailyStats: dailyStats.slice(-30), // Last 30 days
      weeklyStats,
      firstWorkout,
      lastWorkout,
      daysActive: dailyMap.size,
      milestonesReached,
      levelProgress: getLevelProgress(totalXP),
    }
  }, [filteredWorkouts])

  const getUnit = (type?: string) => {
    if (!currentExercise) return ""
    switch (currentExercise.measurement_type) {
      case "seconds":
        return "s"
      case "minutes":
        return "min"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your stats...</p>
        </div>
      </div>
    )
  }

  const maxWeeklyValue = Math.max(...stats.weeklyStats.map((w) => w.total), 1)
  const tier = getLevelTier(stats.levelProgress.currentLevel)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Player Stats</h1>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">@{username}</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Exercise Selector */}
        <div className="mb-8">
          <ExerciseSelector exerciseTypes={exerciseTypes} value={activeExercise} onValueChange={setActiveExercise} />
        </div>

        {/* Level Overview Card */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-card via-card to-primary/10 border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Current Rank</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl">{getTierIcon(tier.name)}</span>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-4xl font-bold text-foreground">{stats.levelProgress.currentLevel}</p>
              </div>
            </div>
            <div className="h-3 bg-background/50 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tier.color} transition-all duration-500`}
                style={{ width: `${stats.levelProgress.progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-muted-foreground">
                {stats.levelProgress.progressInLevel} / {stats.levelProgress.xpForNextLevel} XP
              </span>
              <span className="text-accent">{Math.round(stats.levelProgress.progressPercentage)}%</span>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalXP.toLocaleString()}
              <span className="text-sm text-muted-foreground ml-1">{getUnit()}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Workouts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalWorkouts}</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Average</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.averagePerWorkout}
              <span className="text-sm text-muted-foreground ml-1">{getUnit()}/workout</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Best</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats.bestWorkout}
              <span className="text-sm text-muted-foreground ml-1">{getUnit()}</span>
            </p>
          </div>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold text-foreground">{stats.currentStreak} days</p>
              </div>
            </div>
            {stats.currentStreak > 0 && <p className="text-sm text-orange-400">Keep it up! Don't break the chain!</p>}
            {stats.currentStreak === 0 && (
              <p className="text-sm text-muted-foreground">Log a workout to start a streak!</p>
            )}
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-3xl font-bold text-foreground">{stats.longestStreak} days</p>
              </div>
            </div>
            <p className="text-sm text-purple-400">Your personal best!</p>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="mb-8 p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Progress
          </h3>
          {stats.weeklyStats.length > 0 ? (
            <div className="space-y-3">
              {stats.weeklyStats.map((week, index) => {
                const percentage = (week.total / maxWeeklyValue) * 100
                const weekDate = new Date(week.week)
                const weekLabel = weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })

                return (
                  <div key={week.week} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-16">{weekLabel}</span>
                    <div className="flex-1 h-8 bg-background rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full bg-gradient-to-r ${tier.color} transition-all duration-500 rounded-lg`}
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground">
                        {week.total.toLocaleString()}
                        {getUnit()}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground w-20 text-right">{week.count} sessions</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No workout data yet</p>
          )}
        </div>

        {/* Milestones */}
        <div className="mb-8 p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Milestones
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {MILESTONES.slice(0, 12).map((milestone) => {
              const reached = stats.milestonesReached.includes(milestone)
              return (
                <div
                  key={milestone}
                  className={`p-3 rounded-lg text-center transition-all ${
                    reached
                      ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                      : "bg-background/50 border border-border opacity-50"
                  }`}
                >
                  <span className="text-lg">{reached ? "🏆" : "🔒"}</span>
                  <p className={`text-sm font-bold mt-1 ${reached ? "text-yellow-500" : "text-muted-foreground"}`}>
                    Lv.{milestone}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Activity Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Days Active</p>
              <p className="text-xl font-bold text-foreground">{stats.daysActive}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">First Workout</p>
              <p className="text-xl font-bold text-foreground">
                {stats.firstWorkout?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) ||
                  "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Workout</p>
              <p className="text-xl font-bold text-foreground">
                {stats.lastWorkout?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) ||
                  "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Workout Rate</p>
              <p className="text-xl font-bold text-foreground">
                {stats.daysActive > 0 && stats.firstWorkout
                  ? `${((stats.daysActive / Math.max(1, Math.ceil((Date.now() - stats.firstWorkout.getTime()) / 86400000))) * 100).toFixed(0)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
