import type { WorkoutSession } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

interface WorkoutHistoryProps {
  sessions: WorkoutSession[]
}

export function WorkoutHistory({ sessions }: WorkoutHistoryProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No workouts yet. Start logging your push-ups!</p>
        </CardContent>
      </Card>
    )
  }

  const recentSessions = sessions.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Workouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{session.pushups}</span>
                </div>
                <div>
                  <p className="font-medium">
                    {session.pushups} push-up{session.pushups !== 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.timestamp).toLocaleDateString()} at{" "}
                    {new Date(session.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
