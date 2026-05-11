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
  /** If set, this quest is the upgraded version of the given quest id */
  upgradeOf?: string
  /** If set, unlocking this quest requires the given quest id to be claimed */
  unlockedBy?: string
  /** Visual difficulty tier */
  tier: "normal" | "hard" | "epic"
}

function getPeriodKey(type: "daily" | "weekly"): string {
  const now = new Date()
  if (type === "daily") {
    return now.toISOString().split("T")[0]
  } else {
    const dayOfWeek = now.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday)
    return startOfWeek.toISOString().split("T")[0]
  }
}

/**
 * Returns the level the player had at the start of the current period.
 * If the player has leveled up since then, returns the new level and updates the stored value.
 */
function getLevelAtPeriodStart(type: "daily" | "weekly", currentLevel: number): number {
  const key = `level-at-period-start-${type}-${getPeriodKey(type)}`
  const stored = localStorage.getItem(key)
  if (stored === null) {
    // First visit this period — store current level
    localStorage.setItem(key, String(currentLevel))
    return currentLevel
  }
  return Number(stored)
}

/**
 * For a given period type, returns the set of quest ids that are locked due to no level-up.
 * Upgraded quests whose prerequisite was claimed in the PREVIOUS period but no level-up
 * occurred are stripped — the chains reset to tier 1.
 *
 * Within the CURRENT period this is irrelevant because claims naturally expire per period key.
 * The only thing we need to handle is: if the player claimed an upgrade quest in this period
 * but then the period passed without a level-up, the NEXT period they should start at tier 1.
 *
 * Since keys are period-scoped, this is automatic. What we DO need to enforce is:
 * if the player has NOT leveled up since the period started, show a warning on upgraded quests.
 */
function hasPeriodLevelUp(type: "daily" | "weekly", currentLevel: number): boolean {
  const key = `level-at-period-start-${type}-${getPeriodKey(type)}`
  const stored = localStorage.getItem(key)
  if (stored === null) return false
  return currentLevel > Number(stored)
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

export function QuestPanel({ workouts, exerciseType, exerciseName, currentLevel, userId, onClaimXP }: QuestPanelProps) {
  const [claimedQuests, setClaimedQuests] = useState<Set<string>>(new Set())
  const [dailyLeveledUp, setDailyLeveledUp] = useState(false)
  const [weeklyLeveledUp, setWeeklyLeveledUp] = useState(false)
  const [isLoadingClaims, setIsLoadingClaims] = useState(true)
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Load claimed quests from database
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

    // Track level at start of each period and detect level-ups
    getLevelAtPeriodStart("daily", currentLevel)
    getLevelAtPeriodStart("weekly", currentLevel)
    setDailyLeveledUp(hasPeriodLevelUp("daily", currentLevel))
    setWeeklyLeveledUp(hasPeriodLevelUp("weekly", currentLevel))
  }, [userId, currentLevel, supabase])

  const handleClaimQuest = useCallback(
    async (quest: Quest) => {
      if (quest.claimed || !quest.completed || !onClaimXP || !userId) return

      const questKey = `${quest.id}-${exerciseType}`
      
      // Optimistically update UI
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
          // Check if it's a duplicate error (already claimed)
          if (error.code === "23505") {
            // Already claimed - just keep the optimistic update
            console.log("Quest already claimed")
          } else {
            // Revert optimistic update on other errors
            setClaimedQuests((prev) => {
              const next = new Set(prev)
              next.delete(questKey)
              return next
            })
            console.error("Error claiming quest:", error)
            return
          }
        }

        // Grant the XP
        onClaimXP(quest.id, quest.xpReward)
      } catch (error) {
        // Revert optimistic update on error
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

  // After claiming XP, re-check level-up status (parent updates currentLevel, which triggers the useEffect)
  // This is handled automatically via the [currentLevel] dep in useEffect above

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
    const preWeekBestSet = exerciseWorkouts
      .filter((w) => w.timestamp < startOfWeek)
      .reduce((max, w) => Math.max(max, w.value), 0)

    const isClaimed = (id: string) => claimedQuests.has(`${id}-${exerciseType}`)

    // ─── DAILY QUESTS ─────────────────────────────────────────────────────────

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
        description: `Hit a set of ${Math.max(30, preWeekBestSet + 5)} ${exerciseName.toLowerCase()} this week`,
        progress: weekBestSet,
        target: Math.max(30, preWeekBestSet + 5),
        xpReward: 90,
        completed: weekBestSet >= Math.max(30, preWeekBestSet + 5),
        claimed: isClaimed("weekly-pb"),
        type: "weekly",
        icon: <Star className="w-4 h-4" />,
        tier: "normal",
      },
    ]

    // Filter out locked quests (unlockedBy quest is not yet claimed)
    // and apply unlock logic: upgraded quests are only visible once their predecessor is claimed.
    // Additionally, if the player has NOT leveled up this period, upgraded (tier 2+) quests
    // that were unlocked by claiming a lower quest are reset — they require a level-up to access
    // the harder tier in the next period.
    const allQuests = [...dailyQuests, ...weeklyQuests]

    return allQuests.map((q) => {
      if (q.unlockedBy) {
        const prerequisiteKey = `${q.unlockedBy}-${exerciseType}`
        const prerequisiteClaimed = claimedQuests.has(prerequisiteKey)
        // Gate: the upgrade is only accessible if the prerequisite was claimed AND
        // the player leveled up during this period (proving they earned the harder challenge).
        const periodLeveledUp = q.type === "daily" ? dailyLeveledUp : weeklyLeveledUp
        const isUnlocked = prerequisiteClaimed && periodLeveledUp
        return { ...q, _locked: !isUnlocked, _needsLevelUp: prerequisiteClaimed && !periodLeveledUp }
      }
      return { ...q, _locked: false, _needsLevelUp: false }
    }) as (Quest & { _locked: boolean; _needsLevelUp: boolean })[]
  }, [workouts, exerciseType, exerciseName, claimedQuests, dailyLeveledUp, weeklyLeveledUp])

  const dailyQuests = quests.filter((q) => q.type === "daily")
  const weeklyQuests = quests.filter((q) => q.type === "weekly")

  const visibleDaily = dailyQuests.filter((q) => !(q as any)._locked || (q as any)._needsLevelUp)
  const visibleWeekly = weeklyQuests.filter((q) => !(q as any)._locked || (q as any)._needsLevelUp)

  const completedCount = quests.filter((q) => q.completed && !(q as any)._locked && !(q as any)._needsLevelUp).length
  const totalVisible = quests.filter((q) => !(q as any)._locked && !(q as any)._needsLevelUp).length
  const claimableCount = quests.filter((q) => q.completed && !q.claimed && !(q as any)._locked && !(q as any)._needsLevelUp).length

  // Group quests by chain for rendering
  const groupByChain = (questList: (Quest & { _locked: boolean; _needsLevelUp: boolean })[]) => {
    const chains: (Quest & { _locked: boolean; _needsLevelUp: boolean })[][] = []
    const inChain = new Set<string>()

    questList.forEach((q) => {
      if (inChain.has(q.id)) return
      if (q.upgradeOf) return // will be picked up by the chain root

      // Start a chain from this quest
      const chain: (Quest & { _locked: boolean; _needsLevelUp: boolean })[] = [q]
      inChain.add(q.id)

      // Walk forward through upgrades
      let current: Quest & { _locked: boolean; _needsLevelUp: boolean } = q
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
        {/* Daily Quests */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            <Flame className="w-3 h-3 text-orange-500" />
            Daily Quests
          </h4>
          <div className="space-y-2">
            {dailyChains.map((chain) => (
              <QuestChain key={chain[0].id} chain={chain} onClaim={(q) => handleClaimQuest(q as Quest)} claimingQuestId={claimingQuestId} />
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
              <QuestChain key={chain[0].id} chain={chain} onClaim={(q) => handleClaimQuest(q as Quest)} claimingQuestId={claimingQuestId} />
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
  claimingQuestId,
}: {
  chain: (Quest & { _locked: boolean; _needsLevelUp: boolean })[]
  onClaim: (q: Quest & { _locked: boolean; _needsLevelUp: boolean }) => void
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
  quest: Quest & { _locked: boolean; _needsLevelUp: boolean }
  onClaim: () => void
  isClaiming: boolean
}) {
  const progressPercent = Math.min((quest.progress / quest.target) * 100, 100)
  const canClaim = quest.completed && !quest.claimed
  const isLocked = quest._locked
  const needsLevelUp = quest._needsLevelUp
  const tierStyle = TIER_STYLES[quest.tier]

  if (isLocked) {
    // Two sub-states: needs level-up (prerequisite was claimed but no level-up yet)
    // vs simply not yet unlocked (prerequisite not claimed)
    if (needsLevelUp) {
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
              <Button size="sm" variant="default" className={`h-6 px-2 text-xs gap-1 shrink-0 ${isClaiming ? '' : 'animate-pulse'}`} onClick={onClaim} disabled={isClaiming}>
                {isClaiming ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gift className="w-3 h-3" />}
                {isClaiming ? 'Claiming...' : `Claim +${quest.xpReward} XP`}
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
