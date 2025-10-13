"use client"

import { useEffect, useState } from "react"
import { Trophy, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LevelUpCelebrationProps {
  newLevel: number
  open: boolean
  onClose: () => void
}

export function LevelUpCelebration({ newLevel, open, onClose }: LevelUpCelebrationProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (open) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [open, onClose])

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-md border-primary/50 bg-gradient-to-br from-card via-card to-primary/10">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="w-24 h-24 text-primary animate-bounce" />
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-accent animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-accent animate-pulse delay-150" />
            </div>
          </div>
          <DialogTitle className="text-4xl text-center font-bold text-balance">Level Up!</DialogTitle>
          <DialogDescription className="text-center text-xl pt-2">
            You've reached <span className="text-primary font-bold text-3xl">Level {newLevel}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="text-center text-muted-foreground py-4">
          Keep pushing! You're getting stronger every day! 💪
        </div>
      </DialogContent>
    </Dialog>
  )
}
