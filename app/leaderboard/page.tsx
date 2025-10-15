import { createClient } from "@/lib/supabase/server"
import { calculateLevel } from "@/lib/level-system"
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LeaderboardEntry {
  id: string
  username: string
  total_pushups: number
  workout_count: number
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch leaderboard data
  const { data: leaderboard, error } = await supabase
    .from("leaderboard_stats")
    .select("*")
    .order("total_pushups", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching leaderboard:", error)
  }

  const leaderboardData = (leaderboard || []) as LeaderboardEntry[]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Top push-up champions</p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {leaderboardData.map((entry, index) => {
            const rank = index + 1
            const level = calculateLevel(entry.total_pushups)
            const isCurrentUser = user && entry.id === user.id

            return (
              <Card
                key={entry.id}
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
                    <p className="text-2xl font-bold text-primary">{entry.total_pushups.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">push-ups</p>
                  </div>
                </div>
              </Card>
            )
          })}

          {leaderboardData.length === 0 && (
            <Card className="p-8 bg-card border-border text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No rankings yet. Be the first to start training!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
