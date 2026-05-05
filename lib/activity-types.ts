// Activity types for the smart activity feed
export type ActivityType =
  | "level_up"
  | "milestone"
  | "tier_promotion"
  | "personal_record"
  | "quest_completed"
  | "streak"
  | "workout_logged"
  | "xp_earned"

export type ActivityPriority = "high" | "medium" | "low"

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: Date
  priority: ActivityPriority
  metadata: {
    exerciseType?: string
    exerciseName?: string
    value?: number
    oldValue?: number
    newValue?: number
    level?: number
    tier?: string
    xpEarned?: number
    questName?: string
    streakDays?: number
  }
  read: boolean
  actionable: boolean
  actionLabel?: string
  actionUrl?: string
}

// Priority weights for smart ranking
const PRIORITY_WEIGHTS: Record<ActivityType, number> = {
  tier_promotion: 100,
  milestone: 90,
  level_up: 80,
  personal_record: 70,
  quest_completed: 60,
  streak: 50,
  workout_logged: 30,
  xp_earned: 20,
}

// Get activity priority based on type
export function getActivityPriority(type: ActivityType): ActivityPriority {
  const weight = PRIORITY_WEIGHTS[type]
  if (weight >= 70) return "high"
  if (weight >= 50) return "medium"
  return "low"
}

// Sort activities by relevance (priority + recency)
export function sortActivitiesByRelevance(activities: Activity[]): Activity[] {
  const now = Date.now()
  const ONE_HOUR = 60 * 60 * 1000
  const ONE_DAY = 24 * ONE_HOUR

  return [...activities].sort((a, b) => {
    // Calculate relevance score
    const getScore = (activity: Activity) => {
      const baseWeight = PRIORITY_WEIGHTS[activity.type]
      const ageMs = now - activity.timestamp.getTime()

      // Recency bonus: activities within the last hour get +50, within day +25
      let recencyBonus = 0
      if (ageMs < ONE_HOUR) recencyBonus = 50
      else if (ageMs < ONE_DAY) recencyBonus = 25

      // Unread bonus
      const unreadBonus = activity.read ? 0 : 30

      // Actionable bonus
      const actionableBonus = activity.actionable ? 15 : 0

      return baseWeight + recencyBonus + unreadBonus + actionableBonus
    }

    return getScore(b) - getScore(a)
  })
}

// Group activities by time period
export function groupActivitiesByTime(activities: Activity[]): {
  label: string
  activities: Activity[]
}[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)

  const groups: { label: string; activities: Activity[] }[] = []

  const todayActivities = activities.filter((a) => a.timestamp >= today)
  const yesterdayActivities = activities.filter(
    (a) => a.timestamp >= yesterday && a.timestamp < today
  )
  const thisWeekActivities = activities.filter(
    (a) => a.timestamp >= thisWeekStart && a.timestamp < yesterday
  )
  const olderActivities = activities.filter((a) => a.timestamp < thisWeekStart)

  if (todayActivities.length > 0) {
    groups.push({ label: "Today", activities: todayActivities })
  }
  if (yesterdayActivities.length > 0) {
    groups.push({ label: "Yesterday", activities: yesterdayActivities })
  }
  if (thisWeekActivities.length > 0) {
    groups.push({ label: "This Week", activities: thisWeekActivities })
  }
  if (olderActivities.length > 0) {
    groups.push({ label: "Earlier", activities: olderActivities })
  }

  return groups
}

// Activity icons and colors by type
export const ACTIVITY_STYLES: Record<
  ActivityType,
  { icon: string; bgColor: string; textColor: string; borderColor: string }
> = {
  tier_promotion: {
    icon: "crown",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-500",
    borderColor: "border-yellow-500/30",
  },
  milestone: {
    icon: "flag",
    bgColor: "bg-purple-500/20",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
  },
  level_up: {
    icon: "trending-up",
    bgColor: "bg-primary/20",
    textColor: "text-primary",
    borderColor: "border-primary/30",
  },
  personal_record: {
    icon: "trophy",
    bgColor: "bg-accent/20",
    textColor: "text-accent",
    borderColor: "border-accent/30",
  },
  quest_completed: {
    icon: "check-circle",
    bgColor: "bg-green-500/20",
    textColor: "text-green-500",
    borderColor: "border-green-500/30",
  },
  streak: {
    icon: "flame",
    bgColor: "bg-orange-500/20",
    textColor: "text-orange-500",
    borderColor: "border-orange-500/30",
  },
  workout_logged: {
    icon: "dumbbell",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  xp_earned: {
    icon: "zap",
    bgColor: "bg-accent/20",
    textColor: "text-accent",
    borderColor: "border-accent/30",
  },
}
