"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
import { useLanguage } from "@/lib/i18n/language-context"

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
  measurement_type: "reps" | "minutes" | "seconds"
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

const HOLD_INITIAL_DELAY = 400
const HOLD_START_INTERVAL = 150
const HOLD_MIN_INTERVAL = 50

function useHoldRepeat(action: () => void, disabled?: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const delayRef = useRef(HOLD_START_INTERVAL)

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    delayRef.current = HOLD_START_INTERVAL
  }, [])

  const start = useCallback(() => {
    if (disabled) return
    action()
    const repeat = () => {
      timerRef.current = setTimeout(() => {
        action()
        delayRef.current = Math.max(HOLD_MIN_INTERVAL, Math.floor(delayRef.current * 0.8))
        repeat()
      }, delayRef.current)
    }
    timerRef.current = setTimeout(repeat, HOLD_INITIAL_DELAY)
  }, [action, disabled])

  useEffect(() => () => stop(), [stop])

  return { start, stop }
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
  const { t } = useLanguage()
  const [internalOpen, setInternalOpen] = useState(false)
  const [count, setCount] = useState(10)
  const [displayValue, setDisplayValue] = useState("10")
  const [exerciseType, setExerciseType] = useState<string>("pushups")
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [loading, setLoading] = useState(true)
  const isTypingRef = useRef(false)

  const getTranslatedExerciseName = (exercise: ExerciseType) => {
    const key = exercise.id as keyof typeof t.workoutTypes
    return t.workoutTypes[key] ?? exercise.display_name
  }

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

  // Sync displayValue when count changes externally (hold buttons, quick select, reset)
  useEffect(() => {
    if (!isTypingRef.current) {
      setDisplayValue(String(count))
    }
  }, [count])

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
      isTypingRef.current = false
      setCount(10)
      setDisplayValue("10")
    }
  }, [exerciseType])

  const commitCount = (raw: string): number => {
    const parsed = Number.parseInt(raw)
    if (!isNaN(parsed) && parsed > 0) return parsed
    return Math.max(1, count)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true
    const raw = e.target.value
    setDisplayValue(raw)
    const parsed = Number.parseInt(raw)
    if (!isNaN(parsed) && parsed > 0) {
      setCount(parsed)
    }
  }

  const handleInputBlur = () => {
    isTypingRef.current = false
    const safe = commitCount(displayValue)
    setCount(safe)
    setDisplayValue(String(safe))
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const decrement = useCallback(() => setCount((c) => Math.max(1, c - 1)), [])
  const increment = useCallback(() => setCount((c) => c + 1), [])
  const decrementHold = useHoldRepeat(decrement, disabled)
  const incrementHold = useHoldRepeat(increment, disabled)

  const handleAdd = () => {
    const effective = commitCount(displayValue)
    if (effective > 0) {
      if (onAdd) onAdd(effective, exerciseType)
      if (onWorkoutAdded) onWorkoutAdded()
      setOpen(false)
      isTypingRef.current = false
      setCount(10)
      setDisplayValue("10")
    }
  }

  const getUnitName = () => {
    const exercise = exerciseTypes.find((e) => e.id === exerciseType)
    if (exercise?.measurement_type === "seconds") return count === 1 ? "Second" : "Seconds"
    if (exercise?.measurement_type === "minutes") return count === 1 ? "Minute" : "Minutes"
    return exercise ? getTranslatedExerciseName(exercise) : "Reps"
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
                    {getTranslatedExerciseName(exercise)}
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
            className="h-12 w-12 bg-transparent select-none"
            onPointerDown={decrementHold.start}
            onPointerUp={decrementHold.stop}
            onPointerLeave={decrementHold.stop}
            disabled={disabled}
          >
            <Minus className="h-5 w-5" />
          </Button>
          <div className="flex flex-col items-center gap-2">
            <Input
              type="number"
              min="1"
              value={displayValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              onClick={handleInputFocus}
              className="w-32 text-center text-sm h-12 number-input-no-spin"
              placeholder="Enter value"
              disabled={disabled}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 bg-transparent select-none"
            onPointerDown={incrementHold.start}
            onPointerUp={incrementHold.stop}
            onPointerLeave={incrementHold.stop}
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
              onClick={() => {
                isTypingRef.current = false
                setCount(num)
              }}
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
