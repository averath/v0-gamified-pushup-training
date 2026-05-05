"use client"

import { useState, useMemo, useCallback } from "react"
import { Bell, CheckCheck, Settings2, Filter, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { ActivityCard } from "@/components/activity-card"
import type { Activity, ActivityType } from "@/lib/activity-types"
import {
  sortActivitiesByRelevance,
  groupActivitiesByTime,
  getActivityPriority,
} from "@/lib/activity-types"

type DensityMode = "comfort" | "standard" | "compact"
type SortMode = "relevant" | "recent" | "grouped"

interface ActivityFeedProps {
  activities: Activity[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  onAction?: (activity: Activity) => void
  title?: string
  showHeader?: boolean
  maxHeight?: string
  compact?: boolean
  className?: string
}

export function ActivityFeed({
  activities,
  onMarkRead,
  onMarkAllRead,
  onAction,
  title = "Activity",
  showHeader = true,
  maxHeight = "600px",
  compact = false,
  className,
}: ActivityFeedProps) {
  const [density, setDensity] = useState<DensityMode>(compact ? "compact" : "standard")
  const [sortMode, setSortMode] = useState<SortMode>("relevant")
  const [filterTypes, setFilterTypes] = useState<Set<ActivityType>>(new Set())

  const unreadCount = useMemo(
    () => activities.filter((a) => !a.read).length,
    [activities]
  )

  const filteredActivities = useMemo(() => {
    if (filterTypes.size === 0) return activities
    return activities.filter((a) => filterTypes.has(a.type))
  }, [activities, filterTypes])

  const sortedActivities = useMemo(() => {
    switch (sortMode) {
      case "relevant":
        return sortActivitiesByRelevance(filteredActivities)
      case "recent":
        return [...filteredActivities].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        )
      case "grouped":
        return filteredActivities // Will be grouped in render
      default:
        return filteredActivities
    }
  }, [filteredActivities, sortMode])

  const groupedActivities = useMemo(() => {
    if (sortMode !== "grouped") return null
    return groupActivitiesByTime(sortedActivities)
  }, [sortedActivities, sortMode])

  const toggleFilter = useCallback((type: ActivityType) => {
    setFilterTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilterTypes(new Set())
  }, [])

  const activityTypes: ActivityType[] = [
    "tier_promotion",
    "milestone",
    "level_up",
    "personal_record",
    "quest_completed",
    "streak",
    "workout_logged",
    "xp_earned",
  ]

  const isCompactMode = density === "compact" || compact

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-card via-card to-primary/5 border-border overflow-hidden",
        className
      )}
    >
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/20 relative">
                <Bell className="w-4 h-4 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {title}
            </CardTitle>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && onMarkAllRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onMarkAllRead}
                  className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </Button>
              )}

              {/* Filter dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className={cn(filterTypes.size > 0 && "text-primary")}
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {activityTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={filterTypes.has(type)}
                      onCheckedChange={() => toggleFilter(type)}
                      className="capitalize"
                    >
                      {type.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {filterTypes.size > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearFilters}>
                        Clear filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-sm" variant="ghost">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Display</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={density === "comfort"}
                    onCheckedChange={() => setDensity("comfort")}
                  >
                    Comfort
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={density === "standard"}
                    onCheckedChange={() => setDensity("standard")}
                  >
                    Standard
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={density === "compact"}
                    onCheckedChange={() => setDensity("compact")}
                  >
                    Compact
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={sortMode === "relevant"}
                    onCheckedChange={() => setSortMode("relevant")}
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    Most relevant
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortMode === "recent"}
                    onCheckedChange={() => setSortMode("recent")}
                  >
                    Most recent
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortMode === "grouped"}
                    onCheckedChange={() => setSortMode("grouped")}
                  >
                    Grouped by time
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div style={{ maxHeight }} className="px-4 pb-4 overflow-y-auto">
          {sortedActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No activity yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filterTypes.size > 0
                  ? "Try adjusting your filters"
                  : "Complete workouts to see your achievements here"}
              </p>
            </div>
          ) : sortMode === "grouped" && groupedActivities ? (
            <div className="space-y-6">
              {groupedActivities.map((group) => (
                <div key={group.label}>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 sticky top-0 bg-card py-2">
                    {group.label}
                  </h3>
                  <div
                    className={cn(
                      "space-y-2",
                      density === "comfort" && "space-y-4"
                    )}
                  >
                    {group.activities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onMarkRead={onMarkRead}
                        onAction={onAction}
                        compact={isCompactMode}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={cn("space-y-2", density === "comfort" && "space-y-4")}
            >
              {sortedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onMarkRead={onMarkRead}
                  onAction={onAction}
                  compact={isCompactMode}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
