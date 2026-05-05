"use client"

import { useMemo, useState, useCallback } from "react"
import type { Activity, ActivityType } from "@/lib/activity-types"
import { getActivityPriority } from "@/lib/activity-types"
import {
  getLevelProgress,
  getLevelTier,
  isMilestone,
  LEVEL_TIERS,
} from "@/lib/level-system"

interface Workout {
  id: string
  value: number
  created_at: string
  exercise_type?: string
  is_quest_reward?: boolean
}

interface ExerciseType {
  id: string
  name: string
  display_name: string
}

interface UseActivitiesProps {
  workouts: Workout[]
  exerciseTypes: ExerciseType[]
  totals: Record<string, number>
}

// Storage key for read activities
const READ_ACTIVITIES_KEY = "read-activities"

function getReadActivities(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const stored = localStorage.getItem(READ_ACTIVITIES_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadActivities(ids: Set<string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(READ_ACTIVITIES_KEY, JSON.stringify([...ids]))
}

export function useActivities({
  workouts,
  exerciseTypes,
  totals,
}: UseActivitiesProps) {
  const [readActivities, setReadActivities] = useState<Set<string>>(() =>
    getReadActivities()
  )

  const getExerciseName = useCallback(
    (typeId: string) => {
      const exercise = exerciseTypes.find((e) => e.id === typeId)
      return exercise?.display_name || typeId
    },
    [exerciseTypes]
  )

  // Generate activities from workout data
  const activities = useMemo(() => {
    const result: Activity[] = []
    const workoutsByExercise: Record<string, Workout[]> = {}

    // Group workouts by exercise type
    workouts.forEach((w) => {
      const type = w.exercise_type || "pushups"
      if (!workoutsByExercise[type]) {
        workoutsByExercise[type] = []
      }
      workoutsByExercise[type].push(w)
    })

    // Process each exercise type
    Object.entries(workoutsByExercise).forEach(([exerciseType, exerciseWorkouts]) => {
      // Sort by date ascending to track progression
      const sorted = [...exerciseWorkouts].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      let runningTotal = 0
      let currentLevel = 0
      let currentTier = LEVEL_TIERS[0].name
      let bestSet = 0
      let streakDays = 0
      let lastWorkoutDay = ""

      sorted.forEach((workout) => {
        const workoutDate = new Date(workout.created_at)
        const workoutDay = workoutDate.toISOString().split("T")[0]
        const exerciseName = getExerciseName(exerciseType)

        // Track streak
        if (lastWorkoutDay) {
          const lastDate = new Date(lastWorkoutDay)
          const daysDiff = Math.floor(
            (workoutDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
          )
          if (daysDiff === 1) {
            streakDays++
          } else if (daysDiff > 1) {
            streakDays = 1
          }
        } else {
          streakDays = 1
        }
        lastWorkoutDay = workoutDay

        // Only process regular workouts for achievements
        if (!workout.is_quest_reward) {
          // Workout logged activity
          result.push({
            id: `workout-${workout.id}`,
            type: "workout_logged",
            title: `${exerciseName} Workout Logged`,
            description: `Completed ${workout.value} ${exerciseName.toLowerCase()}`,
            timestamp: workoutDate,
            priority: getActivityPriority("workout_logged"),
            metadata: {
              exerciseType,
              exerciseName,
              value: workout.value,
              xpEarned: workout.value,
            },
            read: readActivities.has(`workout-${workout.id}`),
            actionable: false,
          })

          // Check for personal record
          if (workout.value > bestSet) {
            const oldRecord = bestSet
            bestSet = workout.value
            if (oldRecord > 0) {
              result.push({
                id: `pr-${workout.id}`,
                type: "personal_record",
                title: "New Personal Record!",
                description: `Beat your previous best of ${oldRecord} with ${workout.value} ${exerciseName.toLowerCase()} in a single set`,
                timestamp: workoutDate,
                priority: getActivityPriority("personal_record"),
                metadata: {
                  exerciseType,
                  exerciseName,
                  value: workout.value,
                  oldValue: oldRecord,
                  newValue: workout.value,
                },
                read: readActivities.has(`pr-${workout.id}`),
                actionable: true,
                actionLabel: "View Stats",
                actionUrl: "/stats",
              })
            }
          }

          // Check for streak milestones
          if ([3, 7, 14, 30].includes(streakDays)) {
            result.push({
              id: `streak-${workout.id}-${streakDays}`,
              type: "streak",
              title: `${streakDays}-Day Streak!`,
              description: `You've been consistent for ${streakDays} days in a row`,
              timestamp: workoutDate,
              priority: getActivityPriority("streak"),
              metadata: {
                exerciseType,
                exerciseName,
                streakDays,
              },
              read: readActivities.has(`streak-${workout.id}-${streakDays}`),
              actionable: false,
            })
          }
        }

        // Update running total for level checks
        runningTotal += workout.value
        const newLevelData = getLevelProgress(runningTotal)
        const newLevel = newLevelData.currentLevel
        const newTier = getLevelTier(newLevel)

        // Check for level up
        if (newLevel > currentLevel) {
          // Check for milestone level
          if (isMilestone(newLevel)) {
            result.push({
              id: `milestone-${workout.id}-${newLevel}`,
              type: "milestone",
              title: `Milestone Reached: Level ${newLevel}!`,
              description: `You've reached an incredible milestone in your ${exerciseName.toLowerCase()} journey`,
              timestamp: workoutDate,
              priority: getActivityPriority("milestone"),
              metadata: {
                exerciseType,
                exerciseName,
                level: newLevel,
                tier: newTier.name,
              },
              read: readActivities.has(`milestone-${workout.id}-${newLevel}`),
              actionable: true,
              actionLabel: "Share Achievement",
            })
          } else {
            result.push({
              id: `levelup-${workout.id}-${newLevel}`,
              type: "level_up",
              title: `Level Up! Now Level ${newLevel}`,
              description: `Your ${exerciseName.toLowerCase()} training has advanced to the next level`,
              timestamp: workoutDate,
              priority: getActivityPriority("level_up"),
              metadata: {
                exerciseType,
                exerciseName,
                level: newLevel,
                tier: newTier.name,
              },
              read: readActivities.has(`levelup-${workout.id}-${newLevel}`),
              actionable: false,
            })
          }

          // Check for tier promotion
          if (newTier.name !== currentTier) {
            result.push({
              id: `tier-${workout.id}-${newTier.name}`,
              type: "tier_promotion",
              title: `Promoted to ${newTier.name}!`,
              description: `You've entered a new tier in your fitness journey. Keep pushing!`,
              timestamp: workoutDate,
              priority: getActivityPriority("tier_promotion"),
              metadata: {
                exerciseType,
                exerciseName,
                level: newLevel,
                tier: newTier.name,
              },
              read: readActivities.has(`tier-${workout.id}-${newTier.name}`),
              actionable: true,
              actionLabel: "View Profile",
              actionUrl: "/dashboard",
            })
            currentTier = newTier.name
          }

          currentLevel = newLevel
        }
      })
    })

    // Sort by timestamp descending (most recent first)
    return result.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )
  }, [workouts, exerciseTypes, readActivities, getExerciseName])

  const markAsRead = useCallback((id: string) => {
    setReadActivities((prev) => {
      const next = new Set(prev)
      next.add(id)
      saveReadActivities(next)
      return next
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setReadActivities((prev) => {
      const next = new Set(prev)
      activities.forEach((a) => next.add(a.id))
      saveReadActivities(next)
      return next
    })
  }, [activities])

  const unreadCount = useMemo(
    () => activities.filter((a) => !a.read).length,
    [activities]
  )

  return {
    activities,
    markAsRead,
    markAllAsRead,
    unreadCount,
  }
}
