import { createClient } from "@/lib/supabase/server"
import { calculateLevel } from "@/lib/level-system"
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LeaderboardEntry {
  id: string
  username: string
  exercise_type: string | null
  total_reps: number
  workout_count: number
}

export const revalidate = 30

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const [
    {
      data: { user },
    },
    leaderboardResult,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("leaderboard_stats").select("*").order("total_reps", { ascending: false }),
  ])

  const { data: leaderboard, error } = leaderboardResult

  if (error) {
    console.error("Error fetching leaderboard:", error)
  }

  const leaderboardData = (leaderboard || []) as LeaderboardEntry[]

  const pushupLeaderboard = leaderboardData
    .filter((e) => e.exercise_type === "pushups")
    .sort((a, b) => b.total_reps - a.total_reps)
  const pullupLeaderboard = leaderboardData
    .filter((e) => e.exercise_type === "pullups")
    .sort((a, b) => b.total_reps - a.total_reps)
  const squatLeaderboard = leaderboardData
    .filter((e) => e.exercise_type === "squats")
    .sort((a, b) => b.total_reps - a.total_reps)

  const renderLeaderboard = (data: LeaderboardEntry[], exerciseName: string) => (
    <div className="space-y-3">
      {data.map((entry, index) => {
        const rank = index + 1
        const level = calculateLevel(entry.total_reps)
        const isCurrentUser = user && entry.id === user.id

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

      {data.length === 0 && (
        <Card className="p-8 bg-card border-border text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No rankings yet. Be the first to start training!</p>
        </Card>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={user ? "/dashboard" : "/"}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {user ? "Dashboard" : "Home"}
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Top training champions</p>
        </div>

        <Tabs defaultValue="pushups" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pushups">Push-ups</TabsTrigger>
            <TabsTrigger value="pullups">Pull-ups</TabsTrigger>
            <TabsTrigger value="squats">Squats</TabsTrigger>
          </TabsList>

          <TabsContent value="pushups">{renderLeaderboard(pushupLeaderboard, "Push-ups")}</TabsContent>
          <TabsContent value="pullups">{renderLeaderboard(pullupLeaderboard, "Pull-ups")}</TabsContent>
          <TabsContent value="squats">{renderLeaderboard(squatLeaderboard, "Squats")}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
