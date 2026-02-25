"use client"

import { createClient } from "@/lib/supabase/client"
import { calculateLevel, calculateProgress } from "@/lib/level-system"
import {
  Trophy,
  Medal,
  Award,
  ArrowLeft,
  Loader2,
  Plus,
  Crown,
  Star,
  Zap,
  Flame,
  Shield,
  Dumbbell,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useCallback } from "react"
import { AddWorkoutDialog } from "@/components/add-workout-dialog"
import { Footer } from "@/components/footer"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
  measurement_type: string | null
  xp_multiplier: number
}

interface CombinedEntry {
  id: string
  username: string
  total_xp: number
  workout_count: number
}

interface SubEntry {
  id: string
  username: string
  exercise_type: string | null
  total_reps: number
  workout_count: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COMBINED_TAB = "__combined__"

function unitLabel(measurementType: string | null): string {
  if (measurementType === "seconds") return "sec"
  if (measurementType === "minutes") return "min"
  return "reps"
}

// For the XP legend, show the multiplier scaled to a human-friendly rate.
// Running is stored in minutes but we display "2× / hr" (multiplier × 60).
function legendMultiplierLabel(xpMultiplier: number, measurementType: string | null): string {
  if (measurementType === "minutes") {
    const perHour = Math.round(xpMultiplier * 60 * 100) / 100
    return `${perHour}× / hr`
  }
  if (measurementType === "seconds") {
    return `${xpMultiplier}× / sec`
  }
  return `${xpMultiplier}× / rep`
}

function getLevelIcon(level: number) {
  if (level >= 50) return <Flame className="h-4 w-4 text-red-500" />
  if (level >= 30) return <Zap className="h-4 w-4 text-yellow-500" />
  if (level >= 15) return <Star className="h-4 w-4 text-primary" />
  if (level >= 5) return <Shield className="h-4 w-4 text-accent" />
  return null
}

function getRankStyle(rank: number, isCurrentUser: boolean) {
  if (rank === 1) return "from-yellow-500/30 via-yellow-600/20 to-yellow-500/30 border-yellow-500/50"
  if (rank === 2) return "from-slate-400/30 via-slate-500/20 to-slate-400/30 border-slate-400/50"
  if (rank === 3) return "from-amber-700/30 via-amber-800/20 to-amber-700/30 border-amber-700/50"
  if (isCurrentUser) return "from-primary/20 via-primary/10 to-primary/20 border-primary/50"
  return "from-card via-card to-card border-border/50"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 animate-pulse">
          <Crown className="h-8 w-8 text-yellow-900" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 border-2 border-background">
          1
        </div>
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-400/50">
          <Medal className="h-7 w-7 text-slate-800" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-300 rounded-full flex items-center justify-center text-xs font-bold text-slate-800 border-2 border-background">
          2
        </div>
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-700/50">
          <Award className="h-7 w-7 text-amber-200" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-amber-100 border-2 border-background">
          3
        </div>
      </div>
    )
  }
  return (
    <div className="w-14 h-14 shrink-0 rounded-lg bg-background/80 border-2 border-border flex items-center justify-center">
      <span className="text-2xl font-bold text-muted-foreground">{rank}</span>
    </div>
  )
}

// Combined leaderboard row — shows level + XP
function CombinedRow({
  entry,
  index,
  currentUserId,
}: {
  entry: CombinedEntry
  index: number
  currentUserId: string | null
}) {
  const rank = index + 1
  const level = calculateLevel(entry.total_xp)
  const progress = calculateProgress(entry.total_xp)
  const isCurrentUser = !!currentUserId && entry.id === currentUserId

  return (
    <div
      key={entry.id}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${getRankStyle(rank, isCurrentUser)} transition-all hover:scale-[1.01] hover:shadow-lg`}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          <RankBadge rank={rank} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-lg font-bold truncate">@{entry.username}</p>
              {isCurrentUser && (
                <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-semibold animate-pulse">
                  YOU
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-background/50 rounded-full px-2 py-0.5 border border-border">
                {getLevelIcon(level)}
                <span className="text-xs font-semibold">LVL {level}</span>
              </div>
              <div className="flex-1 max-w-24 h-2 bg-background/80 rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{entry.workout_count} sessions</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="relative">
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {entry.total_xp.toLocaleString()}
              </p>
              {rank <= 3 && (
                <div className="absolute inset-0 blur-lg bg-gradient-to-r from-primary/30 to-accent/30 -z-10" />
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">XP</p>
          </div>
        </div>
      </div>
      {rank <= 3 && (
        <div
          className={`h-1 w-full ${
            rank === 1
              ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"
              : rank === 2
                ? "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300"
                : "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600"
          }`}
        />
      )}
    </div>
  )
}

// Sub-leaderboard row — shows raw count only, no XP bar
function SubRow({
  entry,
  index,
  currentUserId,
  unit,
}: {
  entry: SubEntry
  index: number
  currentUserId: string | null
  unit: string
}) {
  const rank = index + 1
  const isCurrentUser = !!currentUserId && entry.id === currentUserId

  return (
    <div
      key={`${entry.id}-${entry.exercise_type}`}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${getRankStyle(rank, isCurrentUser)} transition-all hover:scale-[1.01] hover:shadow-lg`}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          <RankBadge rank={rank} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold truncate">@{entry.username}</p>
              {isCurrentUser && (
                <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-semibold animate-pulse">
                  YOU
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{entry.workout_count} sessions</p>
          </div>

          <div className="text-right shrink-0">
            <div className="relative">
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {entry.total_reps.toLocaleString()}
              </p>
              {rank <= 3 && (
                <div className="absolute inset-0 blur-lg bg-gradient-to-r from-primary/30 to-accent/30 -z-10" />
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{unit}</p>
          </div>
        </div>
      </div>
      {rank <= 3 && (
        <div
          className={`h-1 w-full ${
            rank === 1
              ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"
              : rank === 2
                ? "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300"
                : "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600"
          }`}
        />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="relative p-12 rounded-xl border-2 border-dashed border-border bg-card/50 text-center">
      <Trophy className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
      <p className="text-xl font-bold text-muted-foreground mb-2">No Champions Yet</p>
      <p className="text-sm text-muted-foreground">Be the first to claim the throne!</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="relative p-12 rounded-xl border-2 border-border bg-card text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
      <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
      <p className="text-muted-foreground font-medium">Loading warriors...</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [exerciseTypesLoading, setExerciseTypesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>(COMBINED_TAB)

  // Combined board data
  const [combinedData, setCombinedData] = useState<CombinedEntry[] | null>(null)
  const [combinedLoading, setCombinedLoading] = useState(false)

  // Per-exercise board data keyed by exercise id
  const [subData, setSubData] = useState<Record<string, SubEntry[] | null>>({})
  const [subLoading, setSubLoading] = useState<Record<string, boolean>>({})

  const [showAddDialog, setShowAddDialog] = useState(false)
  const supabase = createClient()

  // Fetch auth + exercise types on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null))

    async function fetchExerciseTypes() {
      const { data } = await supabase
        .from("exercise_types")
        .select("id, name, display_name, icon, measurement_type, xp_multiplier")
        .order("created_at", { ascending: true })
      if (data && data.length > 0) setExerciseTypes(data)
      setExerciseTypesLoading(false)
    }
    fetchExerciseTypes()
  }, [])

  // Fetch combined leaderboard via API route (uses service role to bypass RLS)
  const fetchCombined = useCallback(async () => {
    setCombinedLoading(true)
    try {
      const res = await fetch("/api/leaderboard/combined")
      const data = await res.json()
      setCombinedData(Array.isArray(data) ? (data as CombinedEntry[]) : [])
    } catch {
      setCombinedData([])
    }
    setCombinedLoading(false)
  }, [])

  // Fetch one exercise sub-leaderboard via API route (uses service role to bypass RLS)
  const fetchSub = useCallback(async (exerciseId: string) => {
    setSubLoading((prev) => ({ ...prev, [exerciseId]: true }))
    try {
      const res = await fetch(`/api/leaderboard/exercise?id=${encodeURIComponent(exerciseId)}`)
      const data = await res.json()
      setSubData((prev) => ({ ...prev, [exerciseId]: Array.isArray(data) ? (data as SubEntry[]) : [] }))
    } catch {
      setSubData((prev) => ({ ...prev, [exerciseId]: [] }))
    }
    setSubLoading((prev) => ({ ...prev, [exerciseId]: false }))
  }, [])

  // Lazy-load data when tab changes
  useEffect(() => {
    if (activeTab === COMBINED_TAB) {
      if (combinedData === null && !combinedLoading) fetchCombined()
    } else {
      if (subData[activeTab] === undefined && !subLoading[activeTab]) fetchSub(activeTab)
    }
  }, [activeTab, combinedData, combinedLoading, subData, subLoading, fetchCombined, fetchSub])

  // Invalidate + refresh current tab after a workout is added
  const handleWorkoutAdded = useCallback(async () => {
    if (activeTab === COMBINED_TAB) {
      setCombinedData(null)
      fetchCombined()
    } else {
      setSubData((prev) => ({ ...prev, [activeTab]: null }))
      fetchSub(activeTab)
    }
  }, [activeTab, fetchCombined, fetchSub])

  const handleAddWorkout = async (count: number, exerciseType: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("workouts").insert({
        user_id: user.id,
        value: count,
        exercise_type: exerciseType,
      })
      if (error) throw error
      await handleWorkoutAdded()
    } catch (error) {
      console.error("Error adding workout:", error)
      alert("Failed to add workout. Please try again.")
    }
  }

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderCombinedBoard = () => {
    if (combinedLoading) return <LoadingState />
    if (!combinedData || combinedData.length === 0) return <EmptyState />

    return (
      <div className="space-y-2">
        {combinedData.map((entry, i) => (
          <CombinedRow key={entry.id} entry={entry} index={i} currentUserId={currentUserId} />
        ))}
      </div>
    )
  }

  const renderSubBoard = (exerciseId: string) => {
    const ex = exerciseTypes.find((e) => e.id === exerciseId)
    const unit = unitLabel(ex?.measurement_type ?? null)
    const data = subData[exerciseId]
    const loading = subLoading[exerciseId]

    if (loading) return <LoadingState />
    if (!data || data.length === 0) return <EmptyState />

    return (
      <div className="space-y-2">
        {data.map((entry, i) => (
          <SubRow key={`${entry.id}-${entry.exercise_type}`} entry={entry} index={i} currentUserId={currentUserId} unit={unit} />
        ))}
      </div>
    )
  }

  // ── XP multiplier legend ────────────────────────────────────────────────���──

  const MultiplierLegend = () => (
    <div className="mb-6 p-4 rounded-xl border border-border bg-card/60">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">XP Multipliers</p>
      <div className="flex flex-wrap gap-2">
        {exerciseTypes.map((ex) => (
          <div
            key={ex.id}
            className="flex items-center gap-1.5 bg-background/70 border border-border rounded-lg px-3 py-1.5"
          >
            {ex.icon && <span className="text-base">{ex.icon}</span>}
            <span className="text-sm font-medium">{ex.display_name}</span>
            <span className="text-xs text-primary font-bold">{legendMultiplierLabel(ex.xp_multiplier, ex.measurement_type)}</span>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Tab bar ────────────────────────────────────────────────────────────────

  const TabBar = () => (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-1 min-w-max bg-card border border-border rounded-xl p-1">
        {/* Combined tab */}
        <button
          onClick={() => setActiveTab(COMBINED_TAB)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === COMBINED_TAB
              ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Combined
        </button>

        {/* Per-exercise tabs */}
        {exerciseTypes.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setActiveTab(ex.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === ex.id
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            }`}
          >
            {ex.icon ? <span className="text-base leading-none">{ex.icon}</span> : <Dumbbell className="h-4 w-4" />}
            {ex.display_name}
          </button>
        ))}
      </div>
    </div>
  )

  // ── Page ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-4xl flex-1">
        {/* Header */}
        <div className="mb-8">
          <Link href={currentUserId ? "/dashboard" : "/"}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {currentUserId ? "Dashboard" : "Home"}
            </Button>
          </Link>

          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-border overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary rounded-tl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary rounded-tr" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary rounded-bl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary rounded-br" />

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <Trophy className="h-9 w-9 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">HALL OF FAME</h1>
                <p className="text-muted-foreground font-medium">Top Training Champions</p>
              </div>
            </div>
          </div>
        </div>

        {exerciseTypesLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* XP multiplier legend — only shown on the combined tab */}
            {activeTab === COMBINED_TAB && <MultiplierLegend />}

            {/* Sub-leaderboard context pill — only shown on exercise tabs */}
            {activeTab !== COMBINED_TAB && (
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="px-3 py-1 bg-card border border-border rounded-full font-medium">
                  Raw {unitLabel(exerciseTypes.find((e) => e.id === activeTab)?.measurement_type ?? null)} — no XP weighting
                </span>
              </div>
            )}

            {/* Tab bar */}
            <TabBar />

            {/* Board content */}
            {activeTab === COMBINED_TAB ? renderCombinedBoard() : renderSubBoard(activeTab)}
          </>
        )}
      </div>

      {/* Floating action button */}
      {currentUserId && (
        <>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 p-0 bg-gradient-to-r from-primary to-accent hover:scale-105"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <AddWorkoutDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            onAdd={handleAddWorkout}
            exerciseTypes={exerciseTypes}
            defaultExerciseType={activeTab === COMBINED_TAB ? (exerciseTypes[0]?.id ?? "") : activeTab}
          />
        </>
      )}

      <Footer />
    </div>
  )
}
