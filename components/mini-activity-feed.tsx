"use client"

import { useMemo } from "react"
import { Bell, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityCard } from "@/components/activity-card"
import { useActivities } from "@/hooks/use-activities"
import { sortActivitiesByRelevance } from "@/lib/activity-types"
import Link from "next/link"

interface Workout {
  id: string
  value: number
  created_at: string
  exercise_type?: string
  is_quest_reward?: boolean
}

interface ExerciseType {
  id: string
  name: string
  display_name: string
}

interface MiniActivityFeedProps {
  workouts: Workout[]
  exerciseTypes: ExerciseType[]
  totals: Record<string, number>
  maxItems?: number
  className?: string
}

export function MiniActivityFeed({
  workouts,
  exerciseTypes,
  totals,
  maxItems = 5,
  className,
}: MiniActivityFeedProps) {
  const { activities, markAsRead, unreadCount } = useActivities({
    workouts,
    exerciseTypes,
    totals,
  })

  // Get the most relevant activities (prioritizing high-impact ones)
  const topActivities = useMemo(() => {
    const sorted = sortActivitiesByRelevance(activities)
    // Filter to show mostly achievements, not every workout
    const prioritized = sorted.filter(
      (a) => a.type !== "workout_logged" || a.priority !== "low"
    )
    return prioritized.slice(0, maxItems)
  }, [activities, maxItems])

  // Check if there are any recent high-priority activities
  const hasHighlights = useMemo(
    () => topActivities.some((a) => a.priority === "high" && !a.read),
    [topActivities]
  )

  if (topActivities.length === 0) {
    return (
      <Card
        className={cn(
          "bg-gradient-to-br from-card via-card to-primary/5 border-border",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              Recent Achievements
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No achievements yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete workouts to earn achievements
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-card via-card to-primary/5 border-border overflow-hidden",
        hasHighlights && "ring-1 ring-primary/20",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20 relative">
              <Sparkles className="w-4 h-4 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            Recent Achievements
          </CardTitle>
          <Link href="/activity">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {topActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onMarkRead={markAsRead}
            compact
          />
        ))}

        {activities.length > maxItems && (
          <Link href="/activity" className="block">
            <Button
              variant="outline"
              className="w-full mt-2 text-muted-foreground hover:text-foreground"
            >
              View {activities.length - maxItems} more activities
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
