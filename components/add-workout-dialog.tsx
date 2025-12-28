"use client"

import { useState, useEffect } from "react"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
  measurement_type: "reps" | "minutes" | "seconds" // added seconds support
}

interface AddWorkoutDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onAdd?: (count: number, exerciseType: string) => void
  onWorkoutAdded?: () => void
  disabled?: boolean
  exerciseTypes?: ExerciseType[]
  defaultExerciseType?: string
}

export function AddWorkoutDialog({
  open: controlledOpen,
  onOpenChange,
  onAdd,
  onWorkoutAdded,
  disabled,
  exerciseTypes: propExerciseTypes,
  defaultExerciseType,
}: AddWorkoutDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [count, setCount] = useState(10)
  const [exerciseType, setExerciseType] = useState<string>("pushups")
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [loading, setLoading] = useState(true)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen

  const supabase = createClient()

  useEffect(() => {
    if (open && defaultExerciseType) {
      setExerciseType(defaultExerciseType)
    }
  }, [open, defaultExerciseType])

  useEffect(() => {
    if (propExerciseTypes && propExerciseTypes.length > 0) {
      setExerciseTypes(propExerciseTypes)
      setExerciseType(defaultExerciseType || propExerciseTypes[0].id)
      setLoading(false)
    } else {
      async function fetchExerciseTypes() {
        const { data } = await supabase.from("exercise_types").select("*").order("created_at", { ascending: true })

        if (data) {
          setExerciseTypes(data)
          if (data.length > 0) {
            setExerciseType(defaultExerciseType || data[0].id)
          }
        }
        setLoading(false)
      }
      fetchExerciseTypes()
    }
  }, [propExerciseTypes, defaultExerciseType])

  const selectedExercise = exerciseTypes.find((e) => e.id === exerciseType)
  const isTimeBased =
    selectedExercise?.measurement_type === "minutes" || selectedExercise?.measurement_type === "seconds"
  const quickCounts =
    selectedExercise?.measurement_type === "seconds"
      ? [15, 30, 45, 60]
      : isTimeBased
        ? [5, 10, 15, 30]
        : [5, 10, 20, 50]

  useEffect(() => {
    if (selectedExercise) {
      setCount(isTimeBased ? 10 : 10)
    }
  }, [exerciseType, isTimeBased])

  const handleAdd = () => {
    if (count > 0) {
      if (onAdd) {
        onAdd(count, exerciseType)
      }
      if (onWorkoutAdded) {
        onWorkoutAdded()
      }
      setOpen(false)
      setCount(10)
    }
  }

  const getUnitName = () => {
    const exercise = exerciseTypes.find((e) => e.id === exerciseType)
    if (exercise?.measurement_type === "seconds") {
      return count === 1 ? "Second" : "Seconds" // added seconds unit display
    }
    if (exercise?.measurement_type === "minutes") {
      return count === 1 ? "Minute" : "Minutes"
    }
    return exercise?.display_name || "Reps"
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-2xl">Log Your Workout</DialogTitle>
        <DialogDescription>Select exercise type and {isTimeBased ? "duration" : "reps"} completed</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-6 py-4">
        {!loading && exerciseTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Exercise Type</label>
            <Select value={exerciseType} onValueChange={setExerciseType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.icon && <span className="mr-2">{exercise.icon}</span>}
                    {exercise.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Counter */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 bg-transparent"
            onClick={() => setCount(Math.max(1, count - 1))}
            disabled={disabled}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <div className="flex flex-col items-center gap-2">
            {/* <div className="text-6xl font-bold text-primary min-w-[120px] text-center">{count}</div> */}
            <Input
              type="number"
              min="1"
              value={count}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value)
                if (!isNaN(value) && value > 0) {
                  setCount(value)
                }
              }}
              className="w-32 text-center text-sm h-12 number-input-no-spin"
              placeholder="Enter value"
              disabled={disabled}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 bg-transparent"
            onClick={() => setCount(count + 1)}
            disabled={disabled}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick select buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickCounts.map((num) => (
            <Button
              key={num}
              variant="secondary"
              onClick={() => setCount(num)}
              className={count === num ? "bg-accent text-accent-foreground" : ""}
              disabled={disabled}
            >
              {num}
            </Button>
          ))}
        </div>

        {/* Submit button */}
        <Button onClick={handleAdd} size="lg" className="w-full text-lg font-bold" disabled={disabled || loading}>
          {disabled ? "Saving..." : `Add ${count} ${getUnitName()}`}
        </Button>
      </div>
    </DialogContent>
  )

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg font-bold h-14 px-8 shadow-lg shadow-primary/30" disabled={disabled}>
          {disabled ? "Saving..." : "Log Workout"}
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  )
}

export { AddWorkoutDialog as AddPushupsDialog }
