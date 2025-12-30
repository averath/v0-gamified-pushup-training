"use client"

import { createClient } from "@/lib/supabase/client"
import { calculateLevel, calculateProgress } from "@/lib/level-system"
import { Trophy, Medal, Award, ArrowLeft, Loader2, Plus, Crown, Star, Zap, Flame, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { ExerciseSelector } from "@/components/exercise-selector"
import { AddWorkoutDialog } from "@/components/add-workout-dialog"
import { useSelectedExercise } from "@/hooks/use-selected-exercise"
import { Footer } from "@/components/footer"

interface LeaderboardEntry {
  id: string
  username: string
  exercise_type: string | null
  total_reps: number
  workout_count: number
}

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
}

export default function LeaderboardPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardEntry[] | null>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [exerciseTypesLoading, setExerciseTypesLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const supabase = createClient()

  const [activeTab, setActiveTab] = useSelectedExercise(exerciseTypes)

  useEffect(() => {
    async function fetchExerciseTypes() {
      const { data } = await supabase.from("exercise_types").select("*").order("created_at", { ascending: true })

      if (data && data.length > 0) {
        setExerciseTypes(data)

        // Initialize loading states
        const initialLoading: Record<string, boolean> = {}
        data.forEach((type) => {
          initialLoading[type.id] = type.id === activeTab
        })
        setLoading(initialLoading)
      }
      setExerciseTypesLoading(false)
    }
    fetchExerciseTypes()
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null)
    })
  }, [])

  useEffect(() => {
    if (!activeTab) return

    const fetchLeaderboard = async (exerciseType: string) => {
      // Skip if already loaded
      if (leaderboardData[exerciseType] !== undefined && leaderboardData[exerciseType] !== null) return

      setLoading((prev) => ({ ...prev, [exerciseType]: true }))

      const { data } = await supabase
        .from("leaderboard_stats")
        .select("*")
        .eq("exercise_type", exerciseType)
        .order("total_reps", { ascending: false })
        .limit(100)

      setLeaderboardData((prev) => ({
        ...prev,
        [exerciseType]: (data || []) as LeaderboardEntry[],
      }))
      setLoading((prev) => ({ ...prev, [exerciseType]: false }))
    }

    fetchLeaderboard(activeTab)
  }, [activeTab])

  const handleWorkoutAdded = async () => {
    if (!activeTab) return

    // Invalidate the current tab's data to force a refresh
    setLeaderboardData((prev) => ({
      ...prev,
      [activeTab]: null,
    }))

    // Refetch the current tab's data
    setLoading((prev) => ({ ...prev, [activeTab]: true }))
    const { data } = await supabase
      .from("leaderboard_stats")
      .select("*")
      .eq("exercise_type", activeTab)
      .order("total_reps", { ascending: false })
      .limit(100)

    setLeaderboardData((prev) => ({
      ...prev,
      [activeTab]: (data || []) as LeaderboardEntry[],
    }))
    setLoading((prev) => ({ ...prev, [activeTab]: false }))
  }

  const handleAddWorkout = async (count: number, exerciseType: string) => {
    console.log("[v0] Adding workout:", count, exerciseType)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("[v0] User not authenticated")
        throw new Error("Not authenticated")
      }

      console.log("[v0] Inserting workout for user:", user.id)
      const { data: newWorkout, error } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          value: count,
          exercise_type: exerciseType,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error inserting workout:", error)
        throw error
      }

      console.log("[v0] Workout added successfully:", newWorkout)

      // Refresh the leaderboard after adding workout
      await handleWorkoutAdded()
    } catch (error) {
      console.error("[v0] Error adding workout:", error)
      alert("Failed to add workout. Please try again.")
    }
  }

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const rank = index + 1
    const level = calculateLevel(entry.total_reps)
    const progress = calculateProgress(entry.total_reps)
    const isCurrentUser = currentUserId && entry.id === currentUserId

    // Rank styling based on position
    const getRankStyle = () => {
      if (rank === 1) return "from-yellow-500/30 via-yellow-600/20 to-yellow-500/30 border-yellow-500"
      if (rank === 2) return "from-slate-400/30 via-slate-500/20 to-slate-400/30 border-slate-400"
      if (rank === 3) return "from-amber-700/30 via-amber-800/20 to-amber-700/30 border-amber-700"
      if (isCurrentUser) return "from-primary/20 via-primary/10 to-primary/20 border-primary"
      return "from-card via-card to-card border-border"
    }

    // Rank badge component
    const RankBadge = () => {
      if (rank === 1) {
        return (
          <div className="relative">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 animate-pulse">
              <Crown className="h-8 w-8 text-yellow-900" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 border-2 border-background">
              1
            </div>
          </div>
        )
      }
      if (rank === 2) {
        return (
          <div className="relative">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-400/50">
              <Medal className="h-7 w-7 text-slate-800" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-300 rounded-full flex items-center justify-center text-xs font-bold text-slate-800 border-2 border-background">
              2
            </div>
          </div>
        )
      }
      if (rank === 3) {
        return (
          <div className="relative">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-700/50">
              <Award className="h-7 w-7 text-amber-200" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-amber-100 border-2 border-background">
              3
            </div>
          </div>
        )
      }
      return (
        <div className="w-14 h-14 rounded-lg bg-background/80 border-2 border-border flex items-center justify-center">
          <span className="text-2xl font-bold text-muted-foreground">{rank}</span>
        </div>
      )
    }

    // Level icon based on level tier
    const getLevelIcon = () => {
      if (level >= 50) return <Flame className="h-4 w-4 text-red-500" />
      if (level >= 30) return <Zap className="h-4 w-4 text-yellow-500" />
      if (level >= 15) return <Star className="h-4 w-4 text-primary" />
      if (level >= 5) return <Shield className="h-4 w-4 text-accent" />
      return null
    }

    return (
      <div
        key={`${entry.id}-${entry.exercise_type}`}
        className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-r ${getRankStyle()} transition-all hover:scale-[1.01] hover:shadow-lg`}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-current opacity-50 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-current opacity-50 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-current opacity-50 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-current opacity-50 rounded-br" />

        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Rank Badge */}
            <RankBadge />

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-lg font-bold truncate">@{entry.username}</p>
                {isCurrentUser && (
                  <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-semibold animate-pulse">
                    YOU
                  </span>
                )}
              </div>

              {/* Level display with XP bar */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-background/50 rounded-full px-2 py-0.5 border border-border">
                  {getLevelIcon()}
                  <span className="text-xs font-semibold">LVL {level}</span>
                </div>

                {/* Mini XP bar */}
                <div className="flex-1 max-w-24 h-2 bg-background/80 rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span className="text-xs text-muted-foreground">{entry.workout_count} sessions</span>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="relative">
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {entry.total_reps.toLocaleString()}
                </p>
                {/* Glow effect for top 3 */}
                {rank <= 3 && (
                  <div className="absolute inset-0 blur-lg bg-gradient-to-r from-primary/30 to-accent/30 -z-10" />
                )}
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">XP</p>
            </div>
          </div>
        </div>

        {/* Bottom accent line for top 3 */}
        {rank <= 3 && (
          <div
            className={`h-1 w-full ${
              rank === 1
                ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"
                : rank === 2
                  ? "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300"
                  : "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600"
            }`}
          />
        )}
      </div>
    )
  }

  const renderLeaderboard = (data: LeaderboardEntry[] | null, exerciseName: string, exerciseType: string) => {
    if (loading[exerciseType]) {
      return (
        <div className="relative p-12 rounded-xl border-2 border-border bg-card text-center overflow-hidden">
          {/* Loading animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground font-medium">Loading warriors...</p>
        </div>
      )
    }

    if (!data || data.length === 0) {
      return (
        <div className="relative p-12 rounded-xl border-2 border-dashed border-border bg-card/50 text-center">
          <Trophy className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-xl font-bold text-muted-foreground mb-2">No Champions Yet</p>
          <p className="text-sm text-muted-foreground">Be the first to claim the throne!</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {/* Top 3 podium section */}
        {data.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {/* 2nd place */}
            <div className="flex flex-col items-center pt-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg mb-2">
                <Medal className="h-8 w-8 text-slate-800" />
              </div>
              <p className="text-sm font-bold truncate max-w-full">@{data[1].username}</p>
              <p className="text-lg font-black text-slate-400">{data[1].total_reps.toLocaleString()}</p>
              <div className="w-full h-20 bg-gradient-to-t from-slate-500 to-slate-400 rounded-t-lg mt-2" />
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 mb-2 animate-pulse">
                <Crown className="h-10 w-10 text-yellow-900" />
              </div>
              <p className="text-sm font-bold truncate max-w-full">@{data[0].username}</p>
              <p className="text-xl font-black text-yellow-500">{data[0].total_reps.toLocaleString()}</p>
              <div className="w-full h-28 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg mt-2" />
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center pt-12">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg mb-2">
                <Award className="h-7 w-7 text-amber-200" />
              </div>
              <p className="text-sm font-bold truncate max-w-full">@{data[2].username}</p>
              <p className="text-lg font-black text-amber-600">{data[2].total_reps.toLocaleString()}</p>
              <div className="w-full h-16 bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-lg mt-2" />
            </div>
          </div>
        )}

        {/* Rankings list */}
        <div className="space-y-2">{data.map((entry, index) => renderLeaderboardEntry(entry, index))}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-4xl flex-1">
        {/* Header */}
        <div className="mb-8">
          <Link href={currentUserId ? "/dashboard" : "/"}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {currentUserId ? "Dashboard" : "Home"}
            </Button>
          </Link>

          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-border overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary rounded-tl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary rounded-tr" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary rounded-bl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary rounded-br" />

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <Trophy className="h-9 w-9 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">HALL OF FAME</h1>
                <p className="text-muted-foreground font-medium">Top Training Champions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Select Exercise Dropdown */}
        {!exerciseTypesLoading && (
          <div className="mb-6">
            <ExerciseSelector exerciseTypes={exerciseTypes} value={activeTab} onValueChange={setActiveTab} />
          </div>
        )}

        {/* Leaderboard Content */}
        {exerciseTypesLoading ? (
          <div className="relative p-12 rounded-xl border-2 border-border bg-card text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
            <p className="text-muted-foreground font-medium">Loading warriors...</p>
          </div>
        ) : (
          activeTab &&
          renderLeaderboard(
            leaderboardData[activeTab] || null,
            exerciseTypes.find((e) => e.id === activeTab)?.display_name || "",
            activeTab,
          )
        )}
      </div>

      {/* Floating action button for logging workouts */}
      {currentUserId && (
        <>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 p-0 bg-gradient-to-r from-primary to-accent hover:scale-105"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <AddWorkoutDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            onAdd={handleAddWorkout}
            exerciseTypes={exerciseTypes}
            defaultExerciseType={activeTab}
          />
        </>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}
