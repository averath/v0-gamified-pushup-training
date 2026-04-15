"use client"

import { useState } from "react"
import type { WorkoutSession } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

type TimePeriod = "all" | "year" | "month" | "week" | "day"

const TIME_PERIODS: { value: TimePeriod; short: string; ms: number | null }[] = [
  { value: "all",   short: "All",   ms: null },
  { value: "year",  short: "Year",  ms: 365 * 24 * 60 * 60 * 1000 },
  { value: "month", short: "Month", ms: 30  * 24 * 60 * 60 * 1000 },
  { value: "week",  short: "Week",  ms: 7   * 24 * 60 * 60 * 1000 },
  { value: "day",   short: "Day",   ms: 1   * 24 * 60 * 60 * 1000 },
]

interface WorkoutHistoryProps {
  sessions: WorkoutSession[]
  exerciseTypes?: Array<{ id: string; display_name: string; measurement_type: string }>
}

export function WorkoutHistory({ sessions, exerciseTypes = [] }: WorkoutHistoryProps) {
  const { t } = useLanguage()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("day")

  const getExerciseDisplay = (session: WorkoutSession) => {    const exerciseType = exerciseTypes.find((e) => e.id === session.exercise_type)
    const isTimeBased = exerciseType?.measurement_type === "minutes"
    const value = session.value

    if (isTimeBased) {
      return {
        text: `${value} minute${value !== 1 ? "s" : ""}`,
        name: exerciseType?.display_name || "Workout",
      }
    }

    // For rep-based exercises, use translated name
    const key = session.exercise_type as keyof typeof t.workoutTypes
    const translatedName = t.workoutTypes[key] ?? exerciseType?.display_name ?? "Workout"
    const singularMap: Record<string, string> = {
      pushups: "push-up",
      pullups: "pull-up",
      squats: "squat",
      burpees: "burpee",
    }
    const baseWord = singularMap[session.exercise_type] ?? translatedName.toLowerCase()

    return {
      text: `${value} ${baseWord}${value !== 1 ? "s" : ""}`,
      name: translatedName,
    }
  }

  const filteredSessions = (() => {
    const period = TIME_PERIODS.find((p) => p.value === timePeriod)
    if (!period || period.ms === null) return sessions
    const since = Date.now() - period.ms
    return sessions.filter((s) => s.timestamp >= since)
  })()

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

  const recentSessions = filteredSessions.slice(0, 50)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Workouts
        </CardTitle>
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {TIME_PERIODS.map(({ value, short }) => (
            <button
              key={value}
              onClick={() => setTimePeriod(value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                timePeriod === value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              }`}
            >
              {short}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {recentSessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No workouts in this period.</p>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}
