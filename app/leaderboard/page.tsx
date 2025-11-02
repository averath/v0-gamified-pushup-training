"use client"

import { createClient } from "@/lib/supabase/client"
import { calculateLevel } from "@/lib/level-system"
import { Trophy, Medal, Award, ArrowLeft, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddWorkoutDialog } from "@/components/add-workout-dialog"
import { useSelectedExercise } from "@/hooks/use-selected-exercise"

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

  const renderLeaderboard = (data: LeaderboardEntry[] | null, exerciseName: string, exerciseType: string) => {
    if (loading[exerciseType]) {
      return (
        <Card className="p-12 bg-card border-border text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </Card>
      )
    }

    if (!data || data.length === 0) {
      return (
        <Card className="p-8 bg-card border-border text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No rankings yet. Be the first to start training!</p>
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {data.map((entry, index) => {
          const rank = index + 1
          const level = calculateLevel(entry.total_reps)
          const isCurrentUser = currentUserId && entry.id === currentUserId

          return (
            <Card
              key={`${entry.id}-${entry.exercise_type}`}
              className={`p-4 transition-all ${
                isCurrentUser ? "bg-primary/10 border-primary/50" : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {rank === 1 && <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />}
                  {rank === 2 && <Medal className="h-8 w-8 text-slate-400 mx-auto" />}
                  {rank === 3 && <Award className="h-8 w-8 text-amber-700 mx-auto" />}
                  {rank > 3 && <span className="text-2xl font-bold text-muted-foreground">{rank}</span>}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-lg font-semibold truncate">@{entry.username}</p>
                    {isCurrentUser && (
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">You</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Level {level} • {entry.workout_count} workouts
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{entry.total_reps.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{exerciseName.toLowerCase()}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={currentUserId ? "/dashboard" : "/"}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {currentUserId ? "Dashboard" : "Home"}
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Top training champions</p>
        </div>

        {/* Select Exercise Dropdown */}
        {!exerciseTypesLoading && (
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Exercise</label>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full max-w-xs bg-card border-border">
                <SelectValue>
                  {(() => {
                    const current = exerciseTypes.find((e) => e.id === activeTab)
                    return (
                      <div className="flex items-center gap-2">
                        {current?.icon && <span>{current.icon}</span>}
                        <span>{current?.display_name || "Select exercise"}</span>
                      </div>
                    )
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    <div className="flex items-center gap-2">
                      {exercise.icon && <span>{exercise.icon}</span>}
                      <span>{exercise.display_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Leaderboard Content */}
        {exerciseTypesLoading ? (
          <Card className="p-12 bg-card border-border text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </Card>
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
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 p-0"
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
    </div>
  )
}
