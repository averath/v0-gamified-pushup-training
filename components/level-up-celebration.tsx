"use client"

import { useEffect, useState } from "react"
import { Trophy, Sparkles, Star } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getLevelTier, getTierIcon, isMilestone, getNextMilestone } from "@/lib/level-system"

interface LevelUpCelebrationProps {
  newLevel: number
  open: boolean
  onClose: () => void
}

export function LevelUpCelebration({ newLevel, open, onClose }: LevelUpCelebrationProps) {
  const [show, setShow] = useState(false)
  const tier = getLevelTier(newLevel)
  const tierIcon = getTierIcon(tier.name)
  const milestone = isMilestone(newLevel)
  const nextMilestone = getNextMilestone(newLevel)

  useEffect(() => {
    if (open) {
      setShow(true)
      const timer = setTimeout(
        () => {
          setShow(false)
          onClose()
        },
        milestone ? 5000 : 3000,
      )
      return () => clearTimeout(timer)
    }
  }, [open, onClose, milestone])

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent
        className={`sm:max-w-md border-2 bg-gradient-to-br from-card via-card to-primary/10 ${milestone ? "border-yellow-500/50" : "border-primary/50"}`}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center animate-bounce shadow-lg`}
              >
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-400 animate-pulse delay-150" />
              {milestone && (
                <>
                  <Star
                    className="absolute top-0 left-0 w-5 h-5 text-yellow-400 animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                  <Star
                    className="absolute bottom-0 right-0 w-4 h-4 text-yellow-400 animate-spin"
                    style={{ animationDuration: "2s" }}
                  />
                </>
              )}
            </div>
          </div>

          <DialogTitle className="text-4xl text-center font-bold text-balance">
            {milestone ? "Milestone Reached!" : "Level Up!"}
          </DialogTitle>

          <DialogDescription className="text-center text-xl pt-2 space-y-2">
            <div>
              You've reached{" "}
              <span className={`font-bold text-3xl bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                Level {newLevel}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-base">
              <span className="text-2xl">{tierIcon}</span>
              <span className={`font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                {tier.name} Rank
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="text-center py-4 space-y-2">
          <p className="text-muted-foreground">
            {milestone
              ? "Amazing achievement! You've hit a major milestone!"
              : "Keep pushing! You're getting stronger every day!"}
          </p>
          {!milestone && (
            <p className="text-sm text-muted-foreground/70">
              Next milestone: <span className="text-accent font-semibold">Level {nextMilestone}</span>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
