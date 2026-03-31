"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/i18n/language-context"

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
}

interface ExerciseSelectorProps {
  exerciseTypes: ExerciseType[]
  value: string
  onValueChange: (value: string) => void
  label?: string
  className?: string
}

export function ExerciseSelector({
  exerciseTypes,
  value,
  onValueChange,
  label = "Select Exercise",
  className = "w-full max-w-xs",
}: ExerciseSelectorProps) {
  const { t } = useLanguage()
  const currentExercise = exerciseTypes.find((e) => e.id === value)

  const getTranslatedName = (exercise: ExerciseType) => {
    const key = exercise.id as keyof typeof t.workoutTypes
    return t.workoutTypes[key] ?? exercise.display_name
  }

  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground mb-2 block">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`${className} bg-card border-border`}>
          <SelectValue>
            <div className="flex items-center gap-2">
              {currentExercise?.icon && <span>{currentExercise.icon}</span>}
              <span>{currentExercise ? getTranslatedName(currentExercise) : "Select exercise"}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {exerciseTypes.map((exercise) => (
            <SelectItem key={exercise.id} value={exercise.id}>
              <div className="flex items-center gap-2">
                {exercise.icon && <span>{exercise.icon}</span>}
                <span>{getTranslatedName(exercise)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
