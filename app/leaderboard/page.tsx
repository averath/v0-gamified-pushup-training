import { redirect } from "next/navigation"
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

  if (!user) {
    redirect("/auth/login")
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-slate-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Training
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-orange-500" />
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-slate-400">Top push-up champions</p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {leaderboardData.map((entry, index) => {
            const rank = index + 1
            const level = calculateLevel(entry.total_pushups)
            const isCurrentUser = entry.id === user.id

            return (
              <Card
                key={entry.id}
                className={`p-4 transition-all ${
                  isCurrentUser ? "bg-orange-500/10 border-orange-500/50" : "bg-slate-900/50 border-slate-800"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {rank === 1 && <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />}
                    {rank === 2 && <Medal className="h-8 w-8 text-slate-400 mx-auto" />}
                    {rank === 3 && <Award className="h-8 w-8 text-amber-700 mx-auto" />}
                    {rank > 3 && <span className="text-2xl font-bold text-slate-500">{rank}</span>}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-lg font-semibold text-white truncate">@{entry.username}</p>
                      {isCurrentUser && (
                        <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">You</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Level {level} • {entry.workout_count} workouts
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-500">{entry.total_pushups.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">push-ups</p>
                  </div>
                </div>
              </Card>
            )
          })}

          {leaderboardData.length === 0 && (
            <Card className="p-8 bg-slate-900/50 border-slate-800 text-center">
              <Trophy className="h-12 w-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No rankings yet. Be the first to start training!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
