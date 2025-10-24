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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

interface ExerciseType {
  id: string
  name: string
  display_name: string
  icon: string | null
}

interface AddPushupsDialogProps {
  onAdd: (count: number, exerciseType: string) => void
  disabled?: boolean
}

export function AddPushupsDialog({ onAdd, disabled }: AddPushupsDialogProps) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(10)
  const [exerciseType, setExerciseType] = useState<string>("pushups")
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchExerciseTypes() {
      const { data } = await supabase.from("exercise_types").select("*").order("created_at", { ascending: true })

      if (data) {
        setExerciseTypes(data)
        if (data.length > 0) {
          setExerciseType(data[0].id)
        }
      }
      setLoading(false)
    }
    fetchExerciseTypes()
  }, [])

  const quickCounts = [5, 10, 20, 50]

  const handleAdd = () => {
    if (count > 0) {
      onAdd(count, exerciseType)
      setOpen(false)
      setCount(10)
    }
  }

  const getExerciseName = () => {
    const exercise = exerciseTypes.find((e) => e.id === exerciseType)
    return exercise?.display_name || "Reps"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg font-bold h-14 px-8 shadow-lg shadow-primary/30" disabled={disabled}>
          {disabled ? "Saving..." : "Log Workout"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Log Your Workout</DialogTitle>
          <DialogDescription>Select exercise type and reps completed</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          {!loading && exerciseTypes.length > 0 && (
            <Tabs value={exerciseType} onValueChange={setExerciseType}>
              <TabsList className={`grid w-full grid-cols-${Math.min(exerciseTypes.length, 4)}`}>
                {exerciseTypes.map((exercise) => (
                  <TabsTrigger key={exercise.id} value={exercise.id}>
                    {exercise.icon && <span className="mr-1">{exercise.icon}</span>}
                    {exercise.display_name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
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
            <div className="text-6xl font-bold text-primary min-w-[120px] text-center">{count}</div>
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
            {disabled ? "Saving..." : `Add ${count} ${getExerciseName()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
