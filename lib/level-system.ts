// Level tiers with rank names
export const LEVEL_TIERS = [
  { name: "Rookie", minLevel: 1, maxLevel: 10, color: "from-gray-400 to-gray-500" },
  { name: "Bronze", minLevel: 11, maxLevel: 25, color: "from-amber-600 to-amber-700" },
  { name: "Silver", minLevel: 26, maxLevel: 50, color: "from-slate-300 to-slate-400" },
  { name: "Gold", minLevel: 51, maxLevel: 75, color: "from-yellow-400 to-yellow-500" },
  { name: "Platinum", minLevel: 76, maxLevel: 100, color: "from-cyan-300 to-cyan-400" },
  { name: "Diamond", minLevel: 101, maxLevel: 150, color: "from-blue-400 to-purple-500" },
  { name: "Master", minLevel: 151, maxLevel: 200, color: "from-purple-500 to-pink-500" },
  { name: "Grandmaster", minLevel: 201, maxLevel: 300, color: "from-red-500 to-orange-500" },
  {
    name: "Legend",
    minLevel: 301,
    maxLevel: Number.POSITIVE_INFINITY,
    color: "from-amber-300 via-yellow-200 to-amber-400",
  },
] as const

// Milestone levels that give special recognition
export const MILESTONES = [10, 25, 50, 75, 100, 150, 200, 250, 300, 500, 1000] as const

// Base XP required for level 1, and growth factor
const BASE_XP = 20 // XP needed for level 1
const GROWTH_FACTOR = 1.15 // Each level needs 15% more XP than previous

// Calculate XP needed to go from level (n-1) to level n
export function getXPForLevel(level: number): number {
  if (level <= 0) return 0
  // Smooth exponential curve: BASE_XP * GROWTH_FACTOR^(level-1)
  return Math.floor(BASE_XP * Math.pow(GROWTH_FACTOR, level - 1))
}

// Calculate total XP required to reach a specific level
export function getTotalPushupsForLevel(level: number): number {
  if (level <= 0) return 0

  // Sum of geometric series: a * (r^n - 1) / (r - 1)
  // where a = BASE_XP, r = GROWTH_FACTOR, n = level
  const total = (BASE_XP * (Math.pow(GROWTH_FACTOR, level) - 1)) / (GROWTH_FACTOR - 1)
  return Math.floor(total)
}

// Calculate pushups needed for the next level (additional pushups)
export function getPushupsForNextLevel(currentLevel: number): number {
  return getXPForLevel(currentLevel + 1)
}

// Calculate current level based on total XP
export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 0

  // Binary search for efficiency at high levels
  let low = 0
  let high = 1000 // Max reasonable level

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2)
    if (getTotalPushupsForLevel(mid) <= totalXP) {
      low = mid
    } else {
      high = mid - 1
    }
  }

  return low
}

// Get the tier for a given level
export function getLevelTier(level: number) {
  return LEVEL_TIERS.find((tier) => level >= tier.minLevel && level <= tier.maxLevel) || LEVEL_TIERS[0]
}

// Check if level is a milestone
export function isMilestone(level: number): boolean {
  return MILESTONES.includes(level as (typeof MILESTONES)[number])
}

// Get next milestone from current level
export function getNextMilestone(level: number): number {
  return MILESTONES.find((m) => m > level) || level + 100
}

// Get progress to next level
export function getLevelProgress(totalPushups: number): {
  currentLevel: number
  nextLevel: number
  currentLevelTotal: number
  nextLevelTotal: number
  progressInLevel: number
  progressPercentage: number
  pushupsNeededForNextLevel: number
  tier: (typeof LEVEL_TIERS)[number]
  isMilestoneLevel: boolean
  nextMilestone: number
  xpForNextLevel: number
} {
  const currentLevel = calculateLevel(totalPushups)
  const nextLevel = currentLevel + 1
  const currentLevelTotal = getTotalPushupsForLevel(currentLevel)
  const nextLevelTotal = getTotalPushupsForLevel(nextLevel)
  const progressInLevel = totalPushups - currentLevelTotal
  const levelRange = nextLevelTotal - currentLevelTotal
  const progressPercentage = levelRange > 0 ? (progressInLevel / levelRange) * 100 : 0
  const pushupsNeededForNextLevel = nextLevelTotal - totalPushups
  const tier = getLevelTier(currentLevel)
  const isMilestoneLevel = isMilestone(currentLevel)
  const nextMilestone = getNextMilestone(currentLevel)
  const xpForNextLevel = getXPForLevel(nextLevel)

  return {
    currentLevel,
    nextLevel,
    currentLevelTotal,
    nextLevelTotal,
    progressInLevel,
    progressPercentage,
    pushupsNeededForNextLevel,
    tier,
    isMilestoneLevel,
    nextMilestone,
    xpForNextLevel,
  }
}

// Helper functions for leaderboard
export function calculateProgress(totalReps: number): number {
  const { progressPercentage } = getLevelProgress(totalReps)
  return progressPercentage
}

export function getXPForCurrentLevel(totalReps: number): number {
  const { progressInLevel } = getLevelProgress(totalReps)
  return progressInLevel
}

export function getXPRequiredForLevel(level: number): number {
  return getTotalPushupsForLevel(level)
}

// Get tier icon based on tier name
export function getTierIcon(tierName: string): string {
  switch (tierName) {
    case "Rookie":
      return "🌱"
    case "Bronze":
      return "🥉"
    case "Silver":
      return "🥈"
    case "Gold":
      return "🥇"
    case "Platinum":
      return "💎"
    case "Diamond":
      return "💠"
    case "Master":
      return "⚔️"
    case "Grandmaster":
      return "👑"
    case "Legend":
      return "🔥"
    default:
      return "⭐"
  }
}
