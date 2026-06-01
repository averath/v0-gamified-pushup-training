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
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

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
  currentLevel: number
  userId: string
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
  upgradeOf?: string
  unlockedBy?: string
  tier: "normal" | "hard" | "epic"
}

interface QuestWithState extends Quest {
  locked: boolean
  needsLevelUp: boolean
}

interface QuestStats {
  todayReps: number
  todaySessionCount: number
  todayBestSet: number
  weekReps: number
  uniqueWorkoutDays: number
  weekSessions: number
  weekBestSet: number
  allTimeBestSet: number
  preWeekBestSet: number
}

function getPeriodKey(type: "daily" | "weekly"): string {
  const now = new Date()
  if (type === "daily") {
    return now.toISOString().split("T")[0]
  }
  const dayOfWeek = now.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday)
  return startOfWeek.toISOString().split("T")[0]
}

/** Records the player's level at the start of this period if not already stored. */
function recordPeriodLevelIfNew(type: "daily" | "weekly", currentLevel: number): void {
  const key = `level-at-period-start-${type}-${getPeriodKey(type)}`
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, String(currentLevel))
  }
}

function hasPeriodLevelUp(type: "daily" | "weekly", currentLevel: number): boolean {
  const key = `level-at-period-start-${type}-${getPeriodKey(type)}`
  const stored = localStorage.getItem(key)
  return stored !== null && currentLevel > Number(stored)
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

function computeQuestStats(workouts: Workout[], exerciseType: string): QuestStats {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dayOfWeek = now.getDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday).getTime()

  const exerciseWorkouts = workouts.filter((w) => w.exercise_type === exerciseType && !w.is_quest_reward)
  const todayWorkouts = exerciseWorkouts.filter((w) => w.timestamp >= startOfDay)
  const weekWorkouts = exerciseWorkouts.filter((w) => w.timestamp >= startOfWeek)
  const preWeekWorkouts = exerciseWorkouts.filter((w) => w.timestamp < startOfWeek)

  return {
    todayReps: todayWorkouts.reduce((sum, w) => sum + w.value, 0),
    todaySessionCount: todayWorkouts.length,
    todayBestSet: todayWorkouts.reduce((max, w) => Math.max(max, w.value), 0),
    weekReps: weekWorkouts.reduce((sum, w) => sum + w.value, 0),
    uniqueWorkoutDays: new Set(
      weekWorkouts.map((w) => {
        const d = new Date(w.timestamp)
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      }),
    ).size,
    weekSessions: weekWorkouts.length,
    weekBestSet: weekWorkouts.reduce((max, w) => Math.max(max, w.value), 0),
    allTimeBestSet: exerciseWorkouts.reduce((max, w) => Math.max(max, w.value), 0),
    preWeekBestSet: preWeekWorkouts.reduce((max, w) => Math.max(max, w.value), 0),
  }
}

function buildDailyQuests(stats: QuestStats, exerciseName: string, isClaimed: (id: string) => boolean): Quest[] {
  const { todayReps, todaySessionCount, todayBestSet, allTimeBestSet } = stats
  const bigSetTarget = Math.max(20, Math.round(allTimeBestSet * 0.5))

  return [
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
      description: `Do ${bigSetTarget} ${exerciseName.toLowerCase()} in one set`,
      progress: todayBestSet,
      target: bigSetTarget,
      xpReward: 35,
      completed: todayBestSet >= bigSetTarget,
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
}

function buildWeeklyQuests(stats: QuestStats, exerciseName: string, isClaimed: (id: string) => boolean): Quest[] {
  const { weekReps, uniqueWorkoutDays, weekSessions, weekBestSet, preWeekBestSet } = stats
  const pbTarget = Math.max(30, preWeekBestSet + 5)

  return [
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
      description: `Hit a set of ${pbTarget} ${exerciseName.toLowerCase()} this week`,
      progress: weekBestSet,
      target: pbTarget,
      xpReward: 90,
      completed: weekBestSet >= pbTarget,
      claimed: isClaimed("weekly-pb"),
      type: "weekly",
      icon: <Star className="w-4 h-4" />,
      tier: "normal",
    },
  ]
}

function applyLockState(
  quests: Quest[],
  exerciseType: string,
  claimedQuests: Set<string>,
  dailyLeveledUp: boolean,
  weeklyLeveledUp: boolean,
): QuestWithState[] {
  return quests.map((q) => {
    if (!q.unlockedBy) {
      return { ...q, locked: false, needsLevelUp: false }
    }
    const prerequisiteClaimed = claimedQuests.has(`${q.unlockedBy}-${exerciseType}`)
    const periodLeveledUp = q.type === "daily" ? dailyLeveledUp : weeklyLeveledUp
    return {
      ...q,
      locked: !(prerequisiteClaimed && periodLeveledUp),
      needsLevelUp: prerequisiteClaimed && !periodLeveledUp,
    }
  })
}

function groupByChain(questList: QuestWithState[]): QuestWithState[][] {
  const chains: QuestWithState[][] = []
  const inChain = new Set<string>()

  for (const q of questList) {
    if (inChain.has(q.id) || q.upgradeOf) continue

    const chain: QuestWithState[] = [q]
    inChain.add(q.id)

    let current = q
    while (true) {
      const next = questList.find((x) => x.upgradeOf === current.id)
      if (!next) break
      chain.push(next)
      inChain.add(next.id)
      current = next
    }

    chains.push(chain)
  }

  return chains
}

export function QuestPanel({ workouts, exerciseType, exerciseName, currentLevel, userId, onClaimXP }: QuestPanelProps) {
  const [claimedQuests, setClaimedQuests] = useState<Set<string>>(new Set())
  const [dailyLeveledUp, setDailyLeveledUp] = useState(false)
  const [weeklyLeveledUp, setWeeklyLeveledUp] = useState(false)
  const [isLoadingClaims, setIsLoadingClaims] = useState(true)
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function loadClaimedQuests() {
      if (!userId) {
        setIsLoadingClaims(false)
        return
      }

      try {
        const dailyPeriodKey = getPeriodKey("daily")
        const weeklyPeriodKey = getPeriodKey("weekly")

        const { data, error } = await supabase
          .from("quest_claims")
          .select("quest_id, exercise_type, period_type, period_key")
          .eq("user_id", userId)
          .or(`and(period_type.eq.daily,period_key.eq.${dailyPeriodKey}),and(period_type.eq.weekly,period_key.eq.${weeklyPeriodKey})`)

        if (error) {
          console.error("Error loading quest claims:", error)
          return
        }

        const claimedSet = new Set<string>()
        data?.forEach((claim) => {
          claimedSet.add(`${claim.quest_id}-${claim.exercise_type}`)
        })
        setClaimedQuests(claimedSet)
      } catch (error) {
        console.error("Error loading quest claims:", error)
      } finally {
        setIsLoadingClaims(false)
      }
    }

    loadClaimedQuests()

    recordPeriodLevelIfNew("daily", currentLevel)
    recordPeriodLevelIfNew("weekly", currentLevel)
    setDailyLeveledUp(hasPeriodLevelUp("daily", currentLevel))
    setWeeklyLeveledUp(hasPeriodLevelUp("weekly", currentLevel))
  }, [userId, currentLevel, supabase])

  const handleClaimQuest = useCallback(
    async (quest: Quest) => {
      if (quest.claimed || !quest.completed || !onClaimXP || !userId) return

      const questKey = `${quest.id}-${exerciseType}`

      setClaimingQuestId(quest.id)
      setClaimedQuests((prev) => new Set([...prev, questKey]))

      try {
        const periodKey = getPeriodKey(quest.type)

        const { error } = await supabase.from("quest_claims").insert({
          user_id: userId,
          quest_id: quest.id,
          exercise_type: exerciseType,
          period_type: quest.type,
          period_key: periodKey,
          xp_amount: quest.xpReward,
        })

        if (error) {
          if (error.code === "23505") {
            console.log("Quest already claimed")
            return
          } else {
            setClaimedQuests((prev) => {
              const next = new Set(prev)
              next.delete(questKey)
              return next
            })
            console.error("Error claiming quest:", error)
            return
          }
        }

        onClaimXP(quest.id, quest.xpReward)
      } catch (error) {
        setClaimedQuests((prev) => {
          const next = new Set(prev)
          next.delete(questKey)
          return next
        })
        console.error("Error claiming quest:", error)
      } finally {
        setClaimingQuestId(null)
      }
    },
    [exerciseType, onClaimXP, userId, supabase],
  )

  const quests = useMemo(() => {
    const stats = computeQuestStats(workouts, exerciseType)
    const isClaimed = (id: string) => claimedQuests.has(`${id}-${exerciseType}`)
    const daily = buildDailyQuests(stats, exerciseName, isClaimed)
    const weekly = buildWeeklyQuests(stats, exerciseName, isClaimed)
    return applyLockState([...daily, ...weekly], exerciseType, claimedQuests, dailyLeveledUp, weeklyLeveledUp)
  }, [workouts, exerciseType, exerciseName, claimedQuests, dailyLeveledUp, weeklyLeveledUp])

  const visibleDaily = quests.filter((q) => q.type === "daily" && (!q.locked || q.needsLevelUp))
  const visibleWeekly = quests.filter((q) => q.type === "weekly" && (!q.locked || q.needsLevelUp))

  const completedCount = quests.filter((q) => q.completed && !q.locked && !q.needsLevelUp).length
  const totalVisible = quests.filter((q) => !q.locked && !q.needsLevelUp).length
  const claimableCount = quests.filter((q) => q.completed && !q.claimed && !q.locked && !q.needsLevelUp).length

  const dailyChains = groupByChain(visibleDaily)
  const weeklyChains = groupByChain(visibleWeekly)

  if (isLoadingClaims) {
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
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

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
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Flame className="w-3 h-3 text-orange-500" />
            Daily Quests
          </h4>
          <div className="space-y-2">
            {dailyChains.map((chain) => (
              <QuestChain key={chain[0].id} chain={chain} onClaim={handleClaimQuest} claimingQuestId={claimingQuestId} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Calendar className="w-3 h-3 text-blue-500" />
            Weekly Quests
          </h4>
          <div className="space-y-2">
            {weeklyChains.map((chain) => (
              <QuestChain key={chain[0].id} chain={chain} onClaim={handleClaimQuest} claimingQuestId={claimingQuestId} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuestChain({
  chain,
  onClaim,
  claimingQuestId,
}: {
  chain: QuestWithState[]
  onClaim: (q: Quest) => void
  claimingQuestId: string | null
}) {
  if (chain.length === 1) {
    return <QuestItem quest={chain[0]} onClaim={() => onClaim(chain[0])} isClaiming={claimingQuestId === chain[0].id} />
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
          <QuestItem quest={quest} onClaim={() => onClaim(quest)} isClaiming={claimingQuestId === quest.id} />
        </div>
      ))}
    </div>
  )
}

function QuestItem({
  quest,
  onClaim,
  isClaiming,
}: {
  quest: QuestWithState
  onClaim: () => void
  isClaiming: boolean
}) {
  const progressPercent = Math.min((quest.progress / quest.target) * 100, 100)
  const canClaim = quest.completed && !quest.claimed
  const tierStyle = TIER_STYLES[quest.tier]

  if (quest.locked) {
    if (quest.needsLevelUp) {
      return (
        <div className="relative p-3 rounded-lg border border-dashed border-destructive/30 bg-destructive/5 opacity-80">
          <div className="flex items-center gap-3">
            <Timer className="w-4 h-4 text-destructive/50 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground/70 truncate">{quest.title}</span>
                {tierStyle.label && (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${tierStyle.badge}`}>
                    {tierStyle.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-destructive/60 mt-0.5 font-medium">
                Level up this period to unlock this challenge
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold shrink-0 text-muted-foreground/40">
              <Zap className="w-3 h-3" />+{quest.xpReward} XP
            </div>
          </div>
        </div>
      )
    }

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
              <Button
                size="sm"
                variant="default"
                className={`h-6 px-2 text-xs gap-1 shrink-0 ${isClaiming ? "" : "animate-pulse"}`}
                onClick={onClaim}
                disabled={isClaiming}
              >
                {isClaiming ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gift className="w-3 h-3" />}
                {isClaiming ? "Claiming..." : `Claim +${quest.xpReward} XP`}
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
