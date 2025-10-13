export interface WorkoutSession {
  id: string
  pushups: number
  timestamp: number
}

export interface UserProgress {
  totalPushups: number
  sessions: WorkoutSession[]
}

const STORAGE_KEY = "pushup-progress"

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") {
    return { totalPushups: 0, sessions: [] }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { totalPushups: 0, sessions: [] }
  }

  try {
    return JSON.parse(stored)
  } catch {
    return { totalPushups: 0, sessions: [] }
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function addWorkoutSession(pushups: number): UserProgress {
  const progress = loadProgress()
  const session: WorkoutSession = {
    id: Date.now().toString(),
    pushups,
    timestamp: Date.now(),
  }

  progress.totalPushups += pushups
  progress.sessions.unshift(session)

  // Keep only last 50 sessions
  if (progress.sessions.length > 50) {
    progress.sessions = progress.sessions.slice(0, 50)
  }

  saveProgress(progress)
  return progress
}

export function resetProgress(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
