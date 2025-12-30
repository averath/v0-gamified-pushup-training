"use client"

import { useState, useMemo } from "react"
import { Target, TrendingUp, Zap, LogOut, Trophy, User, Edit, Plus, BarChart3, Volume2, VolumeX } from "lucide-react"
import { LevelBadge } from "@/components/level-badge"
import { ProgressBar } from "@/components/progress-bar"
import { AddWorkoutDialog } from "@/components/add-workout-dialog"
import { LevelUpCelebration } from "@/components/level-up-celebration"
import { WorkoutHistory } from "@/components/workout-history"
import { StatsCard } from "@/components/stats-card"
import { EditUsernameDialog } from "@/components/edit-username-dialog"
import { QuestPanel } from "@/components/quest-panel"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getLevelProgress, getPushupsForNextLevel, getTotalPushupsForLevel, getTierIcon } from "@/lib/level-system"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ExerciseSelector } from "@/components/exercise-selector"
import { ShareResultsDialog } from "@/components/share-results-dialog"
import { useSelectedExercise } from "@/hooks/use-selected-exercise"
import { useSoundSettings } from "@/hooks/use-sound-settings"
import { Footer } from "@/components/footer"

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
  is_quest_reward?: boolean
}

interface PushupTrackerProps {
  initialWorkouts: Workout[]
  initialTotals: Record<string, number>
  initialWorkoutCounts: Record<string, number>
  username: string
  exerciseTypes: ExerciseType[]
  allWorkouts: Workout[]
}

export function PushupTracker({
  initialWorkouts,
  initialTotals,
  initialWorkoutCounts,
  username,
  exerciseTypes,
  allWorkouts: initialAllWorkouts,
}: PushupTrackerProps) {
  const [totals, setTotals] = useState(initialTotals)
  const [workoutCounts, setWorkoutCounts] = useState(initialWorkoutCounts)
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [allWorkouts, setAllWorkouts] = useState(initialAllWorkouts)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUsername, setCurrentUsername] = useState(username)
  const [showEditUsername, setShowEditUsername] = useState(false)
  const [showAddWorkout, setShowAddWorkout] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [activeExercise, setActiveExercise] = useSelectedExercise(exerciseTypes)
  const { soundEnabled, toggleSound } = useSoundSettings()

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

      const newTotal = (totals[exerciseType] || 0) + count
      setTotals({ ...totals, [exerciseType]: newTotal })
      setWorkoutCounts({ ...workoutCounts, [exerciseType]: (workoutCounts[exerciseType] || 0) + 1 })
      setWorkouts([newWorkout, ...workouts.slice(0, 9)])
      setAllWorkouts([newWorkout, ...allWorkouts])

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

  const handleClaimQuestXP = async (questId: string, xpAmount: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: newWorkout, error } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          value: xpAmount,
          exercise_type: activeExercise,
          is_quest_reward: true, // This is quest XP, not a workout session
        })
        .select()
        .single()

      if (error) throw error

      const oldLevel = getLevelProgress(totals[activeExercise] || 0).currentLevel
      const newTotal = (totals[activeExercise] || 0) + xpAmount

      setTotals({ ...totals, [activeExercise]: newTotal })
      // setWorkoutCounts({ ...workoutCounts, [activeExercise]: (workoutCounts[activeExercise] || 0) + 1 })
      setWorkouts([newWorkout, ...workouts.slice(0, 9)])
      setAllWorkouts([newWorkout, ...allWorkouts])

      // Check for level up
      const newLevelData = getLevelProgress(newTotal)
      if (newLevelData.currentLevel > oldLevel) {
        setNewLevel(newLevelData.currentLevel)
        setShowLevelUp(true)
      }
    } catch (error) {
      console.error("Error claiming quest XP:", error)
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
        .filter((w) => (w.exercise_type || "pushups") === activeExercise && !w.is_quest_reward)
        .map((w) => ({
          id: w.id,
          value: w.value,
          timestamp: new Date(w.created_at).getTime(),
          exercise_type: w.exercise_type || "pushups",
        })),
    [workouts, activeExercise],
  )

  const questWorkouts = useMemo(
    () =>
      allWorkouts.map((w) => ({
        id: w.id,
        value: w.value,
        timestamp: new Date(w.created_at).getTime(),
        exercise_type: w.exercise_type || "pushups",
        is_quest_reward: w.is_quest_reward,
      })),
    [allWorkouts],
  )

  const getExerciseName = (type: string) => {
    const exercise = exerciseTypes.find((e) => e.id === type)
    return exercise?.display_name || "Reps"
  }

  const currentExercise = exerciseTypes.find((e) => e.id === activeExercise)

  const currentWorkoutCount = workoutCounts[activeExercise] || 0

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground hidden sm:block">LVL UP</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ShareResultsDialog
              username={currentUsername}
              exerciseName={getExerciseName(activeExercise)}
              totalReps={currentTotal}
              level={levelData.currentLevel}
              workoutCount={currentWorkoutCount}
            />
            <Link href="/leaderboard">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent px-2 sm:px-3">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Button>
            </Link>
            <Link href="/stats">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent px-2 sm:px-3">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
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
                <DropdownMenuItem onClick={toggleSound}>
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Sound: On
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 mr-2" />
                      Sound: Off
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="mb-8">
          <ExerciseSelector exerciseTypes={exerciseTypes} value={activeExercise} onValueChange={setActiveExercise} />
        </div>

        <div className="mb-8">
          <div className="relative flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl" />
            <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md">
              <div className="flex flex-col items-center gap-2 mb-2">
                <LevelBadge level={levelData.currentLevel} size="lg" showTier />
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Current Level
                    </p>
                    <p className="text-lg font-bold text-foreground flex items-center gap-2">
                      Level {levelData.currentLevel}
                      <span className="text-xl">{getTierIcon(levelData.tier.name)}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Next Level</p>
                  <p className="text-lg font-bold text-accent">Level {levelData.nextLevel}</p>
                </div>
              </div>

              <div className="w-full space-y-2">
                <ProgressBar progress={levelData.progressPercentage} level={levelData.currentLevel} />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    <span className="text-accent font-bold">{levelData.progressInLevel}</span>
                    <span className="mx-1">/</span>
                    <span>{levelData.xpForNextLevel}</span>
                    <span className="ml-1">XP</span>
                  </span>
                  <span className="text-foreground font-bold">{Math.round(levelData.progressPercentage)}%</span>
                </div>
              </div>

              {!levelData.isMilestoneLevel && (
                <div className="text-xs text-muted-foreground">
                  Next milestone: <span className="text-accent font-semibold">Level {levelData.nextMilestone}</span>
                </div>
              )}
              {levelData.isMilestoneLevel && (
                <div className="px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-500 text-xs font-bold uppercase tracking-wider animate-pulse">
                  Milestone Level
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Total XP:</span>
                <span className="text-lg font-bold text-foreground">{currentTotal.toLocaleString()}</span>
              </div>

              <Button size="lg" className="mt-4 gap-2" onClick={() => setShowAddWorkout(true)} disabled={isLoading}>
                <Plus className="h-5 w-5" />
                Log Workout
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <QuestPanel
            workouts={questWorkouts}
            exerciseType={activeExercise}
            exerciseName={getExerciseName(activeExercise)}
            onClaimXP={handleClaimQuestXP}
          />
        </div>

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
          <StatsCard title="Workouts" value={currentWorkoutCount} icon={Zap} description="Sessions logged" />
        </div>

        <WorkoutHistory sessions={sessions} />
      </div>

      <AddWorkoutDialog
        open={showAddWorkout}
        onOpenChange={setShowAddWorkout}
        onAdd={handleAddPushups}
        disabled={isLoading}
        exerciseTypes={exerciseTypes}
        defaultExerciseType={activeExercise}
      />

      <LevelUpCelebration
        newLevel={newLevel}
        open={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        soundEnabled={soundEnabled}
      />

      <Footer />
    </main>
  )
}
