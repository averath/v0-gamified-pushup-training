"use client"

import { useEffect, useState, useRef } from "react"
import { Trophy, Sparkles, Star } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getLevelTier, getTierIcon, isMilestone, getNextMilestone } from "@/lib/level-system"

interface LevelUpCelebrationProps {
  newLevel: number
  open: boolean
  onClose: () => void
  soundEnabled?: boolean // Added soundEnabled prop
}

const SCREAM_TIMESTAMPS = [
  { start: 0, duration: 1.5 },
  { start: 2, duration: 1.8 },
  { start: 4.5, duration: 1.5 },
  { start: 7, duration: 2 },
  { start: 10, duration: 1.5 },
  { start: 12.5, duration: 2 },
  { start: 15, duration: 1.8 },
  { start: 18, duration: 1.5 },
  { start: 20.5, duration: 2 },
  { start: 23, duration: 1.5 },
]

export function LevelUpCelebration({ newLevel, open, onClose, soundEnabled = true }: LevelUpCelebrationProps) {
  const [show, setShow] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const tier = getLevelTier(newLevel)
  const tierIcon = getTierIcon(tier.name)
  const milestone = isMilestone(newLevel)
  const nextMilestone = getNextMilestone(newLevel)

  useEffect(() => {
    if (open) {
      setShow(true)

      if (soundEnabled) {
        const randomScream = SCREAM_TIMESTAMPS[Math.floor(Math.random() * SCREAM_TIMESTAMPS.length)]
        const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wojfer87%20kompilacja%20okrzyko%CC%81w-MUHJehV7sgT32o14yUER1rABDXGQUq.mp3")
        audioRef.current = audio
        audio.currentTime = randomScream.start
        audio.volume = 0.7
        audio.play().catch(() => {
          // Ignore autoplay errors
        })

        // Stop audio after scream duration
        const audioTimer = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
          }
        }, randomScream.duration * 1000)

        // Cleanup audio timer
        const cleanup = () => {
          clearTimeout(audioTimer)
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
          }
        }

        const timer = setTimeout(
          () => {
            setShow(false)
            onClose()
          },
          milestone ? 5000 : 3000,
        )

        return () => {
          clearTimeout(timer)
          cleanup()
        }
      } else {
        // No sound - just show dialog with timer
        const timer = setTimeout(
          () => {
            setShow(false)
            onClose()
          },
          milestone ? 5000 : 3000,
        )

        return () => clearTimeout(timer)
      }
    }
  }, [open, onClose, milestone, soundEnabled])

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
