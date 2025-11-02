"use client"

import { useState, useMemo } from "react"
import { Target, TrendingUp, Zap, LogOut, Trophy, User, Edit, Plus } from "lucide-react"
import { LevelBadge } from "@/components/level-badge"
import { ProgressRing } from "@/components/progress-ring"
import { AddWorkoutDialog } from "@/components/add-workout-dialog"
import { LevelUpCelebration } from "@/components/level-up-celebration"
import { WorkoutHistory } from "@/components/workout-history"
import { StatsCard } from "@/components/stats-card"
import { EditUsernameDialog } from "@/components/edit-username-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getLevelProgress, getPushupsForNextLevel, getTotalPushupsForLevel } from "@/lib/level-system"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShareResultsDialog } from "@/components/share-results-dialog"
import { useSelectedExercise } from "@/hooks/use-selected-exercise"

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
}

interface Workout {
  id: string
  user_id: string
  value: number
  created_at: string
  exercise_type?: string
}

interface PushupTrackerProps {
  initialWorkouts: Workout[]
  initialTotals: Record<string, number>
  username: string
  exerciseTypes: ExerciseType[]
}

export function PushupTracker({ initialWorkouts, initialTotals, username, exerciseTypes }: PushupTrackerProps) {
  const [totals, setTotals] = useState(initialTotals)
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUsername, setCurrentUsername] = useState(username)
  const [showEditUsername, setShowEditUsername] = useState(false)
  const [showAddWorkout, setShowAddWorkout] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [activeExercise, setActiveExercise] = useSelectedExercise(exerciseTypes)

  const handleAddPushups = async (count: number, exerciseType: string) => {
    setIsLoading(true)
    try {
      const oldLevel = getLevelProgress(totals[exerciseType] || 0).currentLevel

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: newWorkout, error } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          value: count,
          exercise_type: exerciseType,
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      const newTotal = (totals[exerciseType] || 0) + count
      setTotals({ ...totals, [exerciseType]: newTotal })
      setWorkouts([newWorkout, ...workouts])

      // Check if leveled up
      const newLevelData = getLevelProgress(newTotal)
      if (newLevelData.currentLevel > oldLevel) {
        setNewLevel(newLevelData.currentLevel)
        setShowLevelUp(true)
      }
    } catch (error) {
      console.error("Error adding workout:", error)
      alert("Failed to add workout. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const currentTotal = totals[activeExercise] || 0
  const levelData = useMemo(() => getLevelProgress(currentTotal), [currentTotal])
  const pushupsForNextLevel = useMemo(() => getPushupsForNextLevel(levelData.currentLevel), [levelData.currentLevel])

  const sessions = useMemo(
    () =>
      workouts
        .filter((w) => (w.exercise_type || "pushups") === activeExercise)
        .map((w) => ({
          id: w.id,
          value: w.value,
          timestamp: new Date(w.created_at).getTime(),
          exercise_type: w.exercise_type || "pushups",
        })),
    [workouts, activeExercise],
  )

  const getExerciseName = (type: string) => {
    const exercise = exerciseTypes.find((e) => e.id === type)
    return exercise?.display_name || "Reps"
  }

  const currentExercise = exerciseTypes.find((e) => e.id === activeExercise)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">LVL UP</h1>
          </div>
          <div className="flex items-center gap-2">
            <ShareResultsDialog
              username={currentUsername}
              exerciseName={getExerciseName(activeExercise)}
              totalReps={currentTotal}
              level={levelData.currentLevel}
              workoutCount={sessions.length}
            />
            <Link href="/leaderboard">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Account</span>
                    <span className="text-xs text-muted-foreground">@{currentUsername}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowEditUsername(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Rename Username
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <EditUsernameDialog
        currentUsername={currentUsername}
        onUsernameUpdate={setCurrentUsername}
        open={showEditUsername}
        onOpenChange={setShowEditUsername}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Select Exercise Dropdown */}
        <div className="mb-8">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Exercise</label>
          <Select value={activeExercise} onValueChange={setActiveExercise}>
            <SelectTrigger className="w-full max-w-xs bg-card border-border">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {currentExercise?.icon && <span>{currentExercise.icon}</span>}
                  <span>{currentExercise?.display_name || "Select exercise"}</span>
                </div>
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

        {/* Main Level Display */}
        <div className="mb-8">
          <div className="relative flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="text-center">
                <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Current Level
                </p>
                <LevelBadge level={levelData.currentLevel} size="lg" />
              </div>

              {/* Progress Ring */}
              <div className="relative">
                <ProgressRing progress={levelData.progressPercentage} size={240} strokeWidth={16} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-bold text-foreground">{Math.round(levelData.progressPercentage)}%</p>
                  <p className="text-sm text-muted-foreground mt-1">to Level {levelData.nextLevel}</p>
                </div>
              </div>

              {/* Progress Text */}
              <div className="text-center">
                <p className="text-lg text-muted-foreground">
                  <span className="text-accent font-bold text-2xl">{levelData.progressInLevel}</span>
                  <span className="mx-2">/</span>
                  <span className="font-semibold">{pushupsForNextLevel}</span>
                  <span className="ml-2">{getExerciseName(activeExercise).toLowerCase()}</span>
                </p>
              </div>

              <Button size="lg" className="mt-4 gap-2" onClick={() => setShowAddWorkout(true)} disabled={isLoading}>
                <Plus className="h-5 w-5" />
                Log Workout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title={`Total ${getExerciseName(activeExercise)}`}
            value={currentTotal.toLocaleString()}
            icon={Target}
            description="All time"
          />
          <StatsCard
            title="Current Level"
            value={levelData.currentLevel}
            icon={TrendingUp}
            description={`Next: ${getTotalPushupsForLevel(levelData.nextLevel).toLocaleString()} total`}
          />
          <StatsCard title="Workouts" value={sessions.length} icon={Zap} description="Sessions logged" />
        </div>

        {/* Workout History */}
        <WorkoutHistory sessions={sessions} />
      </div>

      {/* Controlled AddWorkoutDialog */}
      <AddWorkoutDialog
        open={showAddWorkout}
        onOpenChange={setShowAddWorkout}
        onAdd={handleAddPushups}
        disabled={isLoading}
        exerciseTypes={exerciseTypes}
        defaultExerciseType={activeExercise}
      />

      {/* Level Up Celebration */}
      <LevelUpCelebration newLevel={newLevel} open={showLevelUp} onClose={() => setShowLevelUp(false)} />
    </main>
  )
}
