"use client"

import { useState, useEffect } from "react"

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
}

export function useSelectedExercise(exerciseTypes: ExerciseType[]) {
  const [selectedExercise, setSelectedExercise] = useState<string>("")

  useEffect(() => {
    const savedExercise = localStorage.getItem("selectedExercise")
    const initialExercise =
      savedExercise && exerciseTypes.some((e) => e.id === savedExercise) ? savedExercise : exerciseTypes[0]?.id || ""
    setSelectedExercise(initialExercise)
  }, [exerciseTypes])

  useEffect(() => {
    if (selectedExercise) {
      localStorage.setItem("selectedExercise", selectedExercise)
    }
  }, [selectedExercise])

  return [selectedExercise, setSelectedExercise] as const
}
