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

interface AddPushupsDialogProps {
  onAdd: (count: number) => void
  disabled?: boolean
}

export function AddPushupsDialog({ onAdd, disabled }: AddPushupsDialogProps) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(10)

  const quickCounts = [5, 10, 20, 50]

  const handleAdd = () => {
    if (count > 0) {
      onAdd(count)
      setOpen(false)
      setCount(10)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg font-bold h-14 px-8 shadow-lg shadow-primary/30" disabled={disabled}>
          {disabled ? "Saving..." : "Log Push-ups"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Log Your Push-ups</DialogTitle>
          <DialogDescription>How many push-ups did you complete?</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
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
            {disabled ? "Saving..." : `Add ${count} Push-ups`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
