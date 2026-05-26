interface WorkoutForStreak {
  created_at: string
  is_quest_reward?: boolean
}

function toLocalDateStr(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-CA") // YYYY-MM-DD in local time
}

function parseDateStr(dateStr: string): Date {
  const [y, m, day] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, day, 12, 0, 0) // local noon avoids DST edge cases
}

function getWorkoutDates(workouts: WorkoutForStreak[]): Set<string> {
  return new Set(workouts.filter((w) => !w.is_quest_reward).map((w) => toLocalDateStr(w.created_at)))
}

export function calculateCurrentStreak(workouts: WorkoutForStreak[]): number {
  const dates = getWorkoutDates(workouts)
  if (dates.size === 0) return 0

  const today = new Date()
  const todayStr = today.toLocaleDateString("en-CA")
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toLocaleDateString("en-CA")

  if (!dates.has(todayStr) && !dates.has(yesterdayStr)) return 0

  const cursor = parseDateStr(dates.has(todayStr) ? todayStr : yesterdayStr)
  let streak = 0

  while (dates.has(cursor.toLocaleDateString("en-CA"))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function calculateBestStreak(workouts: WorkoutForStreak[]): number {
  const dates = Array.from(getWorkoutDates(workouts)).sort()
  if (dates.length === 0) return 0

  let best = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = parseDateStr(dates[i - 1])
    const curr = parseDateStr(dates[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      current++
      if (current > best) best = current
    } else {
      current = 1
    }
  }

  return best
}
