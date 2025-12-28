"use client"

import type React from "react"

import { useMemo, useEffect, useState, useCallback } from "react"
import { Scroll, CheckCircle2, Circle, Flame, Calendar, Zap, Gift } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface Workout {
  id: string
  value: number
  timestamp: number
  exercise_type: string
  is_quest_reward?: boolean
}

interface QuestPanelProps {
  workouts: Workout[]
  exerciseType: string
  exerciseName: string
  onClaimXP?: (questId: string, xpAmount: number) => void
}

interface Quest {
  id: string
  title: string
  description: string
  progress: number
  target: number
  xpReward: number
  completed: boolean
  claimed: boolean
  type: "daily" | "weekly"
  icon: React.ReactNode
}

function getClaimedQuestsKey(type: "daily" | "weekly"): string {
  const now = new Date()
  if (type === "daily") {
    return `claimed-quests-daily-${now.toISOString().split("T")[0]}`
  } else {
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    return `claimed-quests-weekly-${startOfWeek.toISOString().split("T")[0]}`
  }
}

export function QuestPanel({ workouts, exerciseType, exerciseName, onClaimXP }: QuestPanelProps) {
  const [claimedQuests, setClaimedQuests] = useState<Set<string>>(new Set())

  // Load claimed quests from localStorage on mount
  useEffect(() => {
    const dailyKey = getClaimedQuestsKey("daily")
    const weeklyKey = getClaimedQuestsKey("weekly")

    const dailyClaimed = JSON.parse(localStorage.getItem(dailyKey) || "[]")
    const weeklyClaimed = JSON.parse(localStorage.getItem(weeklyKey) || "[]")

    setClaimedQuests(new Set([...dailyClaimed, ...weeklyClaimed]))
  }, [])

  const handleClaimQuest = useCallback(
    (quest: Quest) => {
      if (quest.claimed || !quest.completed || !onClaimXP) return

      // Save to localStorage
      const storageKey = getClaimedQuestsKey(quest.type)
      const currentClaimed = JSON.parse(localStorage.getItem(storageKey) || "[]")
      const questKey = `${quest.id}-${exerciseType}`

      if (!currentClaimed.includes(questKey)) {
        currentClaimed.push(questKey)
        localStorage.setItem(storageKey, JSON.stringify(currentClaimed))
      }

      setClaimedQuests((prev) => new Set([...prev, questKey]))
      onClaimXP(quest.id, quest.xpReward)
    },
    [exerciseType, onClaimXP],
  )

  const quests = useMemo(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime()

    // Filter workouts for current exercise type and exclude quest rewards
    const exerciseWorkouts = workouts.filter((w) => w.exercise_type === exerciseType && !w.is_quest_reward)

    // Daily stats
    const todayWorkouts = exerciseWorkouts.filter((w) => w.timestamp >= startOfDay)
    const todayReps = todayWorkouts.reduce((sum, w) => sum + w.value, 0)
    const todaySessionCount = todayWorkouts.length

    // Weekly stats
    const weekWorkouts = exerciseWorkouts.filter((w) => w.timestamp >= startOfWeek)
    const weekReps = weekWorkouts.reduce((sum, w) => sum + w.value, 0)

    // Count unique days with workouts this week
    const uniqueWorkoutDays = new Set(
      weekWorkouts.map((w) => {
        const d = new Date(w.timestamp)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      }),
    ).size

    const questList: Quest[] = [
      {
        id: "daily-reps",
        title: "Daily Grind",
        description: `Complete 50 ${exerciseName.toLowerCase()} today`,
        progress: todayReps,
        target: 50,
        xpReward: 25,
        completed: todayReps >= 50,
        claimed: claimedQuests.has(`daily-reps-${exerciseType}`),
        type: "daily",
        icon: <Flame className="w-4 h-4" />,
      },
      {
        id: "daily-session",
        title: "First Session",
        description: "Log at least one workout today",
        progress: todaySessionCount,
        target: 1,
        xpReward: 10,
        completed: todaySessionCount >= 1,
        claimed: claimedQuests.has(`daily-session-${exerciseType}`),
        type: "daily",
        icon: <Zap className="w-4 h-4" />,
      },
      {
        id: "weekly-consistency",
        title: "Weekly Warrior",
        description: "Work out on 5 different days this week",
        progress: uniqueWorkoutDays,
        target: 5,
        xpReward: 100,
        completed: uniqueWorkoutDays >= 5,
        claimed: claimedQuests.has(`weekly-consistency-${exerciseType}`),
        type: "weekly",
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        id: "weekly-volume",
        title: "Volume King",
        description: `Complete 300 ${exerciseName.toLowerCase()} this week`,
        progress: weekReps,
        target: 300,
        xpReward: 150,
        completed: weekReps >= 300,
        claimed: claimedQuests.has(`weekly-volume-${exerciseType}`),
        type: "weekly",
        icon: <Scroll className="w-4 h-4" />,
      },
    ]

    return questList
  }, [workouts, exerciseType, exerciseName, claimedQuests])

  const dailyQuests = quests.filter((q) => q.type === "daily")
  const weeklyQuests = quests.filter((q) => q.type === "weekly")

  const completedCount = quests.filter((q) => q.completed).length
  const claimableCount = quests.filter((q) => q.completed && !q.claimed).length
  const totalQuests = quests.length

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Scroll className="w-4 h-4 text-primary" />
            </div>
            Quests
          </CardTitle>
          <div className="flex items-center gap-2">
            {claimableCount > 0 && (
              <div className="text-xs text-accent bg-accent/20 px-2 py-1 rounded-full font-bold animate-pulse">
                {claimableCount} to claim!
              </div>
            )}
            <div className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
              {completedCount}/{totalQuests} completed
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Quests */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Flame className="w-3 h-3 text-orange-500" />
            Daily Quests
          </h4>
          <div className="space-y-2">
            {dailyQuests.map((quest) => (
              <QuestItem key={quest.id} quest={quest} onClaim={() => handleClaimQuest(quest)} />
            ))}
          </div>
        </div>

        {/* Weekly Quests */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Calendar className="w-3 h-3 text-blue-500" />
            Weekly Quests
          </h4>
          <div className="space-y-2">
            {weeklyQuests.map((quest) => (
              <QuestItem key={quest.id} quest={quest} onClaim={() => handleClaimQuest(quest)} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuestItem({ quest, onClaim }: { quest: Quest; onClaim: () => void }) {
  const progressPercent = Math.min((quest.progress / quest.target) * 100, 100)
  const canClaim = quest.completed && !quest.claimed

  return (
    <div
      className={`relative p-3 rounded-lg border transition-all ${
        quest.claimed
          ? "bg-primary/10 border-primary/30 opacity-75"
          : quest.completed
            ? "bg-accent/10 border-accent/30"
            : "bg-background/50 border-border hover:border-primary/20"
      }`}
    >
      {/* Completion indicator */}
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 ${quest.claimed ? "text-primary" : quest.completed ? "text-accent" : "text-muted-foreground"}`}
        >
          {quest.claimed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h5
              className={`text-sm font-medium truncate ${
                quest.claimed ? "text-primary line-through" : "text-foreground"
              }`}
            >
              {quest.title}
            </h5>
            {canClaim ? (
              <Button size="sm" variant="default" className="h-6 px-2 text-xs gap-1 animate-pulse" onClick={onClaim}>
                <Gift className="w-3 h-3" />
                Claim +{quest.xpReward} XP
              </Button>
            ) : (
              <div
                className={`flex items-center gap-1 text-xs font-bold shrink-0 ${
                  quest.claimed ? "text-primary" : "text-accent"
                }`}
              >
                <Zap className="w-3 h-3" />+{quest.xpReward} XP
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2">{quest.description}</p>

          <div className="flex items-center gap-2">
            <Progress
              value={progressPercent}
              className={`h-1.5 flex-1 ${quest.claimed ? "[&>div]:bg-primary" : quest.completed ? "[&>div]:bg-accent" : ""}`}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {quest.progress}/{quest.target}
            </span>
          </div>
        </div>
      </div>

      {/* Completed glow effect */}
      {quest.claimed && <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none" />}
      {canClaim && <div className="absolute inset-0 bg-accent/5 rounded-lg pointer-events-none animate-pulse" />}
    </div>
  )
}
