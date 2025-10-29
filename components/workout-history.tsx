import type { WorkoutSession } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

interface WorkoutHistoryProps {
  sessions: WorkoutSession[]
  exerciseTypes?: Array<{ id: string; display_name: string; measurement_type: string }> // added exercise types prop
}

export function WorkoutHistory({ sessions, exerciseTypes = [] }: WorkoutHistoryProps) {
  const getExerciseDisplay = (session: WorkoutSession) => {
    const exerciseType = exerciseTypes.find((e) => e.id === session.exercise_type)
    const isTimeBased = exerciseType?.measurement_type === "minutes"
    const value = session.value

    if (isTimeBased) {
      return {
        text: `${value} minute${value !== 1 ? "s" : ""}`,
        name: exerciseType?.display_name || "Workout",
      }
    }

    // For rep-based exercises
    let name = "rep"
    switch (session.exercise_type) {
      case "pushups":
        name = "push-up"
        break
      case "pullups":
        name = "pull-up"
        break
      case "squats":
        name = "squat"
        break
      default:
        name = exerciseType?.display_name?.toLowerCase() || "rep"
    }

    return {
      text: `${value} ${name}${value !== 1 ? "s" : ""}`,
      name: exerciseType?.display_name || "Workout",
    }
  }

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
          <p className="text-muted-foreground text-center py-8">No workouts yet. Start logging your workouts!</p>
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
          {recentSessions.map((session) => {
            const display = getExerciseDisplay(session)
            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">{session.value}</span>
                  </div>
                  <div>
                    <p className="font-medium">{display.text}</p>
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
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
