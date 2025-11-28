// Calculate total pushups required to reach a specific level
export function getTotalPushupsForLevel(level: number): number {
  if (level === 0) return 0

  // Sum of 10^1 + 10^2 + ... + 10^level
  let total = 0
  for (let i = 1; i <= level; i++) {
    total += Math.pow(10, i)
  }
  return total
}

// Calculate pushups needed for the next level (additional pushups)
export function getPushupsForNextLevel(currentLevel: number): number {
  return Math.pow(10, currentLevel + 1)
}

// Calculate current level based on total pushups
export function calculateLevel(totalPushups: number): number {
  let level = 0
  while (totalPushups >= getTotalPushupsForLevel(level + 1)) {
    level++
  }
  return level
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
} {
  const currentLevel = calculateLevel(totalPushups)
  const nextLevel = currentLevel + 1
  const currentLevelTotal = getTotalPushupsForLevel(currentLevel)
  const nextLevelTotal = getTotalPushupsForLevel(nextLevel)
  const progressInLevel = totalPushups - currentLevelTotal
  const levelRange = nextLevelTotal - currentLevelTotal
  const progressPercentage = (progressInLevel / levelRange) * 100
  const pushupsNeededForNextLevel = nextLevelTotal - totalPushups

  return {
    currentLevel,
    nextLevel,
    currentLevelTotal,
    nextLevelTotal,
    progressInLevel,
    progressPercentage,
    pushupsNeededForNextLevel,
  }
}

// Helper functions for leaderboard
// Calculate progress percentage to next level
export function calculateProgress(totalReps: number): number {
  const { progressPercentage } = getLevelProgress(totalReps)
  return progressPercentage
}

// Get XP earned within current level
export function getXPForCurrentLevel(totalReps: number): number {
  const { progressInLevel } = getLevelProgress(totalReps)
  return progressInLevel
}

// Get total XP required for a specific level
export function getXPRequiredForLevel(level: number): number {
  return getTotalPushupsForLevel(level)
}
