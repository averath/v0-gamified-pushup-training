"use client"

import { useState } from "react"
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

interface AddPushupsDialogProps {
  onAdd: (count: number, exerciseType: string) => void
  disabled?: boolean
}

export function AddPushupsDialog({ onAdd, disabled }: AddPushupsDialogProps) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(10)
  const [exerciseType, setExerciseType] = useState<"pushups" | "pullups" | "squats">("pushups")

  const quickCounts = [5, 10, 20, 50]

  const handleAdd = () => {
    if (count > 0) {
      onAdd(count, exerciseType)
      setOpen(false)
      setCount(10)
    }
  }

  const getExerciseName = () => {
    switch (exerciseType) {
      case "pushups":
        return "Push-ups"
      case "pullups":
        return "Pull-ups"
      case "squats":
        return "Squats"
    }
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
          <Tabs value={exerciseType} onValueChange={(v) => setExerciseType(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pushups">Push-ups</TabsTrigger>
              <TabsTrigger value="pullups">Pull-ups</TabsTrigger>
              <TabsTrigger value="squats">Squats</TabsTrigger>
            </TabsList>
          </Tabs>

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
          <Button onClick={handleAdd} size="lg" className="w-full text-lg font-bold" disabled={disabled}>
            {disabled ? "Saving..." : `Add ${count} ${getExerciseName()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
