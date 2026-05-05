"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  Crown,
  Flag,
  TrendingUp,
  Trophy,
  CheckCircle2,
  Flame,
  Dumbbell,
  Zap,
  ChevronRight,
  Check,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Activity, ActivityType } from "@/lib/activity-types"
import { ACTIVITY_STYLES } from "@/lib/activity-types"
import Link from "next/link"

const ICON_MAP: Record<string, React.ElementType> = {
  crown: Crown,
  flag: Flag,
  "trending-up": TrendingUp,
  trophy: Trophy,
  "check-circle": CheckCircle2,
  flame: Flame,
  dumbbell: Dumbbell,
  zap: Zap,
}

interface ActivityCardProps {
  activity: Activity
  onMarkRead?: (id: string) => void
  onAction?: (activity: Activity) => void
  compact?: boolean
}

export function ActivityCard({
  activity,
  onMarkRead,
  onAction,
  compact = false,
}: ActivityCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const style = ACTIVITY_STYLES[activity.type]
  const IconComponent = ICON_MAP[style.icon] || Zap

  const timeAgo = formatDistanceToNow(activity.timestamp, { addSuffix: true })

  const handleMarkRead = () => {
    if (!activity.read && onMarkRead) {
      onMarkRead(activity.id)
    }
  }

  const handleAction = () => {
    if (onAction) {
      onAction(activity)
    }
  }

  // Render value badge for certain activity types
  const renderValueBadge = () => {
    const { metadata } = activity

    if (activity.type === "level_up" && metadata.level) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
          Level {metadata.level}
        </span>
      )
    }

    if (activity.type === "tier_promotion" && metadata.tier) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold uppercase">
          {metadata.tier}
        </span>
      )
    }

    if (activity.type === "personal_record" && metadata.value) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
          {metadata.value} reps
        </span>
      )
    }

    if (activity.type === "xp_earned" && metadata.xpEarned) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
          +{metadata.xpEarned} XP
        </span>
      )
    }

    if (activity.type === "streak" && metadata.streakDays) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500 text-xs font-bold">
          {metadata.streakDays} days
        </span>
      )
    }

    return null
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
          "hover:bg-secondary/50",
          !activity.read && "bg-secondary/30"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleMarkRead}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleMarkRead()}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            style.bgColor
          )}
        >
          <IconComponent className={cn("w-4 h-4", style.textColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm truncate",
              !activity.read ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {activity.title}
          </p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>

        {renderValueBadge()}

        {!activity.read && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all duration-300",
        style.borderColor,
        !activity.read && "bg-secondary/20",
        isHovered && "border-primary/50 shadow-lg shadow-primary/5"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Priority indicator */}
      {activity.priority === "high" && !activity.read && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      )}

      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300",
              style.bgColor,
              isHovered && "scale-110"
            )}
          >
            <IconComponent className={cn("w-5 h-5", style.textColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4
                    className={cn(
                      "font-semibold",
                      !activity.read ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {activity.title}
                  </h4>
                  {renderValueBadge()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {timeAgo}
              </span>
            </div>

            {/* Expanded content */}
            {isExpanded && activity.metadata.exerciseName && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Exercise: {activity.metadata.exerciseName}</span>
                  {activity.metadata.xpEarned && (
                    <span className="text-accent">+{activity.metadata.xpEarned} XP</span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div
              className={cn(
                "flex items-center gap-2 mt-3 transition-all duration-200",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            >
              {activity.actionable && activity.actionUrl && (
                <Button size="sm" variant="default" asChild className="gap-1">
                  <Link href={activity.actionUrl}>
                    {activity.actionLabel || "View"}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </Button>
              )}

              {activity.actionable && !activity.actionUrl && onAction && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleAction}
                  className="gap-1"
                >
                  {activity.actionLabel || "Take Action"}
                  <ChevronRight className="w-3 h-3" />
                </Button>
              )}

              {!activity.read && onMarkRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMarkRead}
                  className="gap-1 text-muted-foreground"
                >
                  <Check className="w-3 h-3" />
                  Mark as read
                </Button>
              )}

              {activity.metadata.exerciseName && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="gap-1 text-muted-foreground ml-auto"
                >
                  <Eye className="w-3 h-3" />
                  {isExpanded ? "Less" : "More"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unread indicator dot */}
      {!activity.read && (
        <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  )
}
