"use client"

import { useState, useMemo } from "react"
import { Target, TrendingUp, Zap, LogOut, Trophy } from "lucide-react"
import { LevelBadge } from "@/components/level-badge"
import { ProgressRing } from "@/components/progress-ring"
import { AddPushupsDialog } from "@/components/add-pushups-dialog"
import { LevelUpCelebration } from "@/components/level-up-celebration"
import { WorkoutHistory } from "@/components/workout-history"
import { StatsCard } from "@/components/stats-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLevelProgress, getPushupsForNextLevel, getTotalPushupsForLevel } from "@/lib/level-system"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Workout {
  id: string
  user_id: string
  pushups: number
  created_at: string
  exercise_type?: string
}

interface PushupTrackerProps {
  initialWorkouts: Workout[]
  initialTotals: {
    pushups: number
    pullups: number
    squats: number
  }
  username: string
}

export function PushupTracker({ initialWorkouts, initialTotals, username }: PushupTrackerProps) {
  const [totals, setTotals] = useState(initialTotals)
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [activeExercise, setActiveExercise] = useState<"pushups" | "pullups" | "squats">("pushups")
  const router = useRouter()
  const supabase = createClient()

  const handleAddPushups = async (count: number, exerciseType: string) => {
    setIsLoading(true)
    try {
      const oldLevel = getLevelProgress(totals[exerciseType as keyof typeof totals]).currentLevel

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: newWorkout, error } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          pushups: count,
          exercise_type: exerciseType,
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      const newTotal = totals[exerciseType as keyof typeof totals] + count
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

  const currentTotal = totals[activeExercise]
  const levelData = useMemo(() => getLevelProgress(currentTotal), [currentTotal])
  const pushupsForNextLevel = useMemo(() => getPushupsForNextLevel(levelData.currentLevel), [levelData.currentLevel])

  const sessions = useMemo(
    () =>
      workouts
        .filter((w) => (w.exercise_type || "pushups") === activeExercise)
        .map((w) => ({
          id: w.id,
          pushups: w.pushups,
          timestamp: new Date(w.created_at).getTime(),
        })),
    [workouts, activeExercise],
  )

  const getExerciseName = (type: string) => {
    switch (type) {
      case "pushups":
        return "Push-ups"
      case "pullups":
        return "Pull-ups"
      case "squats":
        return "Squats"
      default:
        return "Reps"
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">PUSHUP TRACK</h1>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/leaderboard">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeExercise} onValueChange={(v) => setActiveExercise(v as any)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pushups">Push-ups</TabsTrigger>
            <TabsTrigger value="pullups">Pull-ups</TabsTrigger>
            <TabsTrigger value="squats">Squats</TabsTrigger>
          </TabsList>

          <TabsContent value={activeExercise} className="mt-0">
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

                  {/* Add Button */}
                  <AddPushupsDialog onAdd={handleAddPushups} disabled={isLoading} />
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Level Up Celebration */}
      <LevelUpCelebration newLevel={newLevel} open={showLevelUp} onClose={() => setShowLevelUp(false)} />
    </main>
  )
}
