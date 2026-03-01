"use client"

import type React from "react"

import { useMemo, useEffect, useState, useCallback } from "react"
import {
  Scroll,
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  Zap,
  Gift,
  ChevronRight,
  Lock,
  Swords,
  Target,
  Trophy,
  Star,
  TrendingUp,
  Timer,
} from "lucide-react"
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
  /** If set, this quest is the upgraded version of the given quest id */
  upgradeOf?: string
  /** If set, unlocking this quest requires the given quest id to be claimed */
  unlockedBy?: string
  /** Visual difficulty tier */
  tier: "normal" | "hard" | "epic"
}

function getClaimedQuestsKey(type: "daily" | "weekly"): string {
  const now = new Date()
  if (type === "daily") {
    return `claimed-quests-daily-${now.toISOString().split("T")[0]}`
  } else {
    const dayOfWeek = now.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday)
    return `claimed-quests-weekly-${startOfWeek.toISOString().split("T")[0]}`
  }
}

const TIER_STYLES: Record<Quest["tier"], { border: string; bg: string; badge: string; label: string }> = {
  normal: {
    border: "border-border",
    bg: "bg-background/50",
    badge: "bg-muted text-muted-foreground",
    label: "",
  },
  hard: {
    border: "border-orange-500/40",
    bg: "bg-orange-500/5",
    badge: "bg-orange-500/20 text-orange-400",
    label: "HARD",
  },
  epic: {
    border: "border-purple-500/50",
    bg: "bg-purple-500/5",
    badge: "bg-purple-500/20 text-purple-400",
    label: "EPIC",
  },
}

export function QuestPanel({ workouts, exerciseType, exerciseName, onClaimXP }: QuestPanelProps) {
  const [claimedQuests, setClaimedQuests] = useState<Set<string>>(new Set())

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
    const dayOfWeek = now.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday).getTime()

    const exerciseWorkouts = workouts.filter((w) => w.exercise_type === exerciseType && !w.is_quest_reward)

    // Daily stats
    const todayWorkouts = exerciseWorkouts.filter((w) => w.timestamp >= startOfDay)
    const todayReps = todayWorkouts.reduce((sum, w) => sum + w.value, 0)
    const todaySessionCount = todayWorkouts.length
    const todayBestSet = todayWorkouts.reduce((max, w) => Math.max(max, w.value), 0)

    // Weekly stats
    const weekWorkouts = exerciseWorkouts.filter((w) => w.timestamp >= startOfWeek)
    const weekReps = weekWorkouts.reduce((sum, w) => sum + w.value, 0)
    const uniqueWorkoutDays = new Set(
      weekWorkouts.map((w) => {
        const d = new Date(w.timestamp)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      }),
    ).size
    const weekSessions = weekWorkouts.length
    const weekBestSet = weekWorkouts.reduce((max, w) => Math.max(max, w.value), 0)

    // All-time stats
    const allTimeBestSet = exerciseWorkouts.reduce((max, w) => Math.max(max, w.value), 0)

    const isClaimed = (id: string) => claimedQuests.has(`${id}-${exerciseType}`)

    // ─── DAILY QUESTS ─────────────────────────────────────────────────────────

    // Chain 1: Daily Grind → Daily Beast → Daily Legend
    const dailyGrindClaimed = isClaimed("daily-reps")
    const dailyBeastClaimed = isClaimed("daily-reps-hard")

    // Chain 2: First Session → Triple Session
    const firstSessionClaimed = isClaimed("daily-session")

    // Chain 3: Big Set → Mega Set
    const bigSetClaimed = isClaimed("daily-bigset")

    const dailyQuests: Quest[] = [
      // Chain 1 – rep volume
      {
        id: "daily-reps",
        title: "Daily Grind",
        description: `Complete 50 ${exerciseName.toLowerCase()} today`,
        progress: todayReps,
        target: 50,
        xpReward: 25,
        completed: todayReps >= 50,
        claimed: isClaimed("daily-reps"),
        type: "daily",
        icon: <Flame className="w-4 h-4" />,
        tier: "normal",
      },
      {
        id: "daily-reps-hard",
        title: "Daily Beast",
        description: `Complete 100 ${exerciseName.toLowerCase()} today`,
        progress: todayReps,
        target: 100,
        xpReward: 60,
        completed: todayReps >= 100,
        claimed: isClaimed("daily-reps-hard"),
        type: "daily",
        icon: <Flame className="w-4 h-4" />,
        upgradeOf: "daily-reps",
        unlockedBy: "daily-reps",
        tier: "hard",
      },
      {
        id: "daily-reps-epic",
        title: "Daily Legend",
        description: `Complete 200 ${exerciseName.toLowerCase()} today`,
        progress: todayReps,
        target: 200,
        xpReward: 150,
        completed: todayReps >= 200,
        claimed: isClaimed("daily-reps-epic"),
        type: "daily",
        icon: <Flame className="w-4 h-4" />,
        upgradeOf: "daily-reps-hard",
        unlockedBy: "daily-reps-hard",
        tier: "epic",
      },
      // Chain 2 – session count
      {
        id: "daily-session",
        title: "First Session",
        description: "Log at least one workout today",
        progress: todaySessionCount,
        target: 1,
        xpReward: 10,
        completed: todaySessionCount >= 1,
        claimed: isClaimed("daily-session"),
        type: "daily",
        icon: <Zap className="w-4 h-4" />,
        tier: "normal",
      },
      {
        id: "daily-session-hard",
        title: "Triple Session",
        description: "Log 3 workouts today",
        progress: todaySessionCount,
        target: 3,
        xpReward: 40,
        completed: todaySessionCount >= 3,
        claimed: isClaimed("daily-session-hard"),
        type: "daily",
        icon: <Zap className="w-4 h-4" />,
        upgradeOf: "daily-session",
        unlockedBy: "daily-session",
        tier: "hard",
      },
      // Chain 3 – single-set challenge
      {
        id: "daily-bigset",
        title: "Big Set",
        description: `Do ${Math.max(20, Math.round(allTimeBestSet * 0.5) || 20)} ${exerciseName.toLowerCase()} in one set`,
        progress: todayBestSet,
        target: Math.max(20, Math.round(allTimeBestSet * 0.5) || 20),
        xpReward: 35,
        completed: todayBestSet >= Math.max(20, Math.round(allTimeBestSet * 0.5) || 20),
        claimed: isClaimed("daily-bigset"),
        type: "daily",
        icon: <Target className="w-4 h-4" />,
        tier: "normal",
      },
      {
        id: "daily-bigset-hard",
        title: "Max Set",
        description: `Beat your all-time best set (${allTimeBestSet} reps)`,
        progress: todayBestSet,
        target: allTimeBestSet + 1,
        xpReward: 80,
        completed: todayBestSet >= allTimeBestSet + 1,
        claimed: isClaimed("daily-bigset-hard"),
        type: "daily",
        icon: <Target className="w-4 h-4" />,
        upgradeOf: "daily-bigset",
        unlockedBy: "daily-bigset",
        tier: "hard",
      },
    ]

    // ─── WEEKLY QUESTS ────────────────────────────────────────────────────────

    // Chain 1: consistency
    const weeklyConsistencyClaimed = isClaimed("weekly-consistency")

    // Chain 2: volume
    const weeklyVolumeClaimed = isClaimed("weekly-volume")

    const weeklyQuests: Quest[] = [
      // Chain 1 – consistency
      {
        id: "weekly-consistency",
        title: "Weekly Warrior",
        description: "Work out on 5 different days this week",
        progress: uniqueWorkoutDays,
        target: 5,
        xpReward: 100,
        completed: uniqueWorkoutDays >= 5,
        claimed: isClaimed("weekly-consistency"),
        type: "weekly",
        icon: <Calendar className="w-4 h-4" />,
        tier: "normal",
      },
      {
        id: "weekly-consistency-hard",
        title: "Perfect Week",
        description: "Work out every day this week (7 days)",
        progress: uniqueWorkoutDays,
        target: 7,
        xpReward: 250,
        completed: uniqueWorkoutDays >= 7,
        claimed: isClaimed("weekly-consistency-hard"),
        type: "weekly",
        icon: <Calendar className="w-4 h-4" />,
        upgradeOf: "weekly-consistency",
        unlockedBy: "weekly-consistency",
        tier: "epic",
      },
      // Chain 2 – volume
      {
        id: "weekly-volume",
        title: "Volume King",
        description: `Complete 300 ${exerciseName.toLowerCase()} this week`,
        progress: weekReps,
        target: 300,
        xpReward: 150,
        completed: weekReps >= 300,
        claimed: isClaimed("weekly-volume"),
        type: "weekly",
        icon: <Scroll className="w-4 h-4" />,
        tier: "normal",
      },
      {
        id: "weekly-volume-hard",
        title: "Volume Monster",
        description: `Complete 600 ${exerciseName.toLowerCase()} this week`,
        progress: weekReps,
        target: 600,
        xpReward: 300,
        completed: weekReps >= 600,
        claimed: isClaimed("weekly-volume-hard"),
        type: "weekly",
        icon: <Scroll className="w-4 h-4" />,
        upgradeOf: "weekly-volume",
        unlockedBy: "weekly-volume",
        tier: "hard",
      },
      {
        id: "weekly-volume-epic",
        title: "Unstoppable",
        description: `Complete 1000 ${exerciseName.toLowerCase()} this week`,
        progress: weekReps,
        target: 1000,
        xpReward: 600,
        completed: weekReps >= 1000,
        claimed: isClaimed("weekly-volume-epic"),
        type: "weekly",
        icon: <Trophy className="w-4 h-4" />,
        upgradeOf: "weekly-volume-hard",
        unlockedBy: "weekly-volume-hard",
        tier: "epic",
      },
      // Chain 3 – session streak
      {
        id: "weekly-sessions",
        title: "Dedicated",
        description: "Log 7 workouts this week",
        progress: weekSessions,
        target: 7,
        xpReward: 120,
        completed: weekSessions >= 7,
        claimed: isClaimed("weekly-sessions"),
        type: "weekly",
        icon: <TrendingUp className="w-4 h-4" />,
        tier: "normal",
      },
      {
        id: "weekly-sessions-hard",
        title: "Relentless",
        description: "Log 15 workouts this week",
        progress: weekSessions,
        target: 15,
        xpReward: 275,
        completed: weekSessions >= 15,
        claimed: isClaimed("weekly-sessions-hard"),
        type: "weekly",
        icon: <Swords className="w-4 h-4" />,
        upgradeOf: "weekly-sessions",
        unlockedBy: "weekly-sessions",
        tier: "hard",
      },
      // Standalone: weekly personal best
      {
        id: "weekly-pb",
        title: "Personal Best",
        description: `Hit a set of ${Math.max(30, weekBestSet + 5)} ${exerciseName.toLowerCase()} this week`,
        progress: weekBestSet,
        target: Math.max(30, weekBestSet + 5),
        xpReward: 90,
        completed: weekBestSet >= Math.max(30, weekBestSet + 5),
        claimed: isClaimed("weekly-pb"),
        type: "weekly",
        icon: <Star className="w-4 h-4" />,
        tier: "normal",
      },
    ]

    // Filter out locked quests (unlockedBy quest is not yet claimed)
    // and apply unlock logic: upgraded quests are only visible once their predecessor is claimed
    const allQuests = [...dailyQuests, ...weeklyQuests]

    return allQuests.map((q) => {
      if (q.unlockedBy) {
        const prerequisiteKey = `${q.unlockedBy}-${exerciseType}`
        const isUnlocked = claimedQuests.has(prerequisiteKey)
        return { ...q, _locked: !isUnlocked }
      }
      return { ...q, _locked: false }
    }) as (Quest & { _locked: boolean })[]
  }, [workouts, exerciseType, exerciseName, claimedQuests])

  const dailyQuests = quests.filter((q) => q.type === "daily")
  const weeklyQuests = quests.filter((q) => q.type === "weekly")

  const visibleDaily = dailyQuests.filter((q) => !(q as any)._locked)
  const visibleWeekly = weeklyQuests.filter((q) => !(q as any)._locked)

  const completedCount = quests.filter((q) => q.completed && !(q as any)._locked).length
  const totalVisible = quests.filter((q) => !(q as any)._locked).length
  const claimableCount = quests.filter((q) => q.completed && !q.claimed && !(q as any)._locked).length

  // Group quests by chain for rendering
  const groupByChain = (questList: (Quest & { _locked: boolean })[]) => {
    const chains: (Quest & { _locked: boolean })[][] = []
    const inChain = new Set<string>()

    questList.forEach((q) => {
      if (inChain.has(q.id)) return
      if (q.upgradeOf) return // will be picked up by the chain root

      // Start a chain from this quest
      const chain: (Quest & { _locked: boolean })[] = [q]
      inChain.add(q.id)

      // Walk forward through upgrades
      let current: Quest & { _locked: boolean } = q
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const next = questList.find((x) => x.upgradeOf === current.id)
        if (!next) break
        chain.push(next)
        inChain.add(next.id)
        current = next
      }

      chains.push(chain)
    })

    return chains
  }

  const dailyChains = groupByChain(visibleDaily)
  const weeklyChains = groupByChain(visibleWeekly)

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
              {completedCount}/{totalVisible} done
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Daily Quests */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Flame className="w-3 h-3 text-orange-500" />
            Daily Quests
          </h4>
          <div className="space-y-2">
            {dailyChains.map((chain) => (
              <QuestChain key={chain[0].id} chain={chain} onClaim={(q) => handleClaimQuest(q as Quest)} />
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
            {weeklyChains.map((chain) => (
              <QuestChain key={chain[0].id} chain={chain} onClaim={(q) => handleClaimQuest(q as Quest)} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/** Renders a single chain of quests horizontally linked with arrows */
function QuestChain({
  chain,
  onClaim,
}: {
  chain: (Quest & { _locked: boolean })[]
  onClaim: (q: Quest & { _locked: boolean }) => void
}) {
  if (chain.length === 1) {
    return <QuestItem quest={chain[0]} onClaim={() => onClaim(chain[0])} />
  }

  return (
    <div className="space-y-1">
      {chain.map((quest, idx) => (
        <div key={quest.id}>
          {idx > 0 && (
            <div className="flex items-center gap-1 pl-4 py-0.5">
              <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/50 uppercase tracking-widest">
                {TIER_STYLES[quest.tier].label ? `Upgrades to ${TIER_STYLES[quest.tier].label}` : "Upgrades"}
              </span>
            </div>
          )}
          <QuestItem quest={quest} onClaim={() => onClaim(quest)} />
        </div>
      ))}
    </div>
  )
}

function QuestItem({
  quest,
  onClaim,
}: {
  quest: Quest & { _locked: boolean }
  onClaim: () => void
}) {
  const progressPercent = Math.min((quest.progress / quest.target) * 100, 100)
  const canClaim = quest.completed && !quest.claimed
  const isLocked = quest._locked
  const tierStyle = TIER_STYLES[quest.tier]

  if (isLocked) {
    return (
      <div className="relative p-3 rounded-lg border border-dashed border-border/40 bg-background/20 opacity-60">
        <div className="flex items-center gap-3">
          <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground/50 truncate">{quest.title}</span>
              {tierStyle.label && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${tierStyle.badge}`}>
                  {tierStyle.label}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground/40 mt-0.5">Complete the previous quest to unlock</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold shrink-0 text-muted-foreground/40">
            <Zap className="w-3 h-3" />+{quest.xpReward} XP
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative p-3 rounded-lg border transition-all ${
        quest.claimed
          ? "bg-primary/10 border-primary/30 opacity-75"
          : canClaim
            ? `${tierStyle.bg} ${tierStyle.border}`
            : `${tierStyle.bg} ${tierStyle.border} hover:border-primary/20`
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 ${quest.claimed ? "text-primary" : quest.completed ? "text-accent" : "text-muted-foreground"}`}
        >
          {quest.claimed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h5
                className={`text-sm font-medium truncate ${
                  quest.claimed ? "text-primary line-through" : "text-foreground"
                }`}
              >
                {quest.title}
              </h5>
              {quest.tier !== "normal" && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold shrink-0 ${tierStyle.badge}`}>
                  {tierStyle.label}
                </span>
              )}
            </div>
            {canClaim ? (
              <Button size="sm" variant="default" className="h-6 px-2 text-xs gap-1 animate-pulse shrink-0" onClick={onClaim}>
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
              className={`h-1.5 flex-1 ${
                quest.claimed
                  ? "[&>div]:bg-primary"
                  : quest.tier === "epic"
                    ? "[&>div]:bg-purple-500"
                    : quest.tier === "hard"
                      ? "[&>div]:bg-orange-500"
                      : quest.completed
                        ? "[&>div]:bg-accent"
                        : ""
              }`}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {quest.progress}/{quest.target}
            </span>
          </div>
        </div>
      </div>

      {quest.claimed && <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none" />}
      {canClaim && <div className="absolute inset-0 bg-accent/5 rounded-lg pointer-events-none animate-pulse" />}
    </div>
  )
}
