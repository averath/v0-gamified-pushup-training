"use client"

import { useState, useEffect } from "react"

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
}

export function useSelectedExercise(exerciseTypes: ExerciseType[]) {
  const [selectedExercise, setSelectedExercise] = useState<string>(() => {
    // Initialize state with localStorage value or first exercise type on mount
    if (typeof window !== "undefined") {
      const savedExercise = localStorage.getItem("selectedExercise")
      if (savedExercise && exerciseTypes.some((e) => e.id === savedExercise)) {
        return savedExercise
      }
    }
    return exerciseTypes[0]?.id || ""
  })

  // Update state when exerciseTypes changes (e.g., after loading from API)
  useEffect(() => {
    if (!selectedExercise && exerciseTypes.length > 0) {
      const savedExercise = localStorage.getItem("selectedExercise")
      const initialExercise =
        savedExercise && exerciseTypes.some((e) => e.id === savedExercise)
          ? savedExercise
          : exerciseTypes[0]?.id || ""
      setSelectedExercise(initialExercise)
    }
  }, [exerciseTypes, selectedExercise])

  // Save to localStorage whenever selection changes
  useEffect(() => {
    if (selectedExercise) {
      localStorage.setItem("selectedExercise", selectedExercise)
    }
  }, [selectedExercise])

  return [selectedExercise, setSelectedExercise] as const
}
