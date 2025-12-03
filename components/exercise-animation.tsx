"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Info, X } from "lucide-react"

interface ExerciseAnimationProps {
  exerciseType: string
}

// Pushup animation component with CSS keyframes
function PushupAnimation() {
  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      {/* Ground line */}
      <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-muted-foreground/30 rounded-full" />

      {/* Animated figure */}
      <svg viewBox="0 0 200 80" className="w-full max-w-[280px] h-auto" style={{ overflow: "visible" }}>
        {/* Body group with animation */}
        <g className="animate-pushup origin-[160px_60px]">
          {/* Hands (stationary on ground) */}
          <circle cx="40" cy="60" r="6" className="fill-primary" />
          <circle cx="160" cy="60" r="6" className="fill-primary" />

          {/* Arms */}
          <line x1="40" y1="60" x2="60" y2="35" className="stroke-primary" strokeWidth="8" strokeLinecap="round" />
          <line x1="160" y1="60" x2="140" y2="35" className="stroke-primary" strokeWidth="8" strokeLinecap="round" />

          {/* Torso */}
          <line x1="60" y1="35" x2="140" y2="35" className="stroke-primary" strokeWidth="10" strokeLinecap="round" />

          {/* Head */}
          <circle cx="155" cy="25" r="12" className="fill-primary" />

          {/* Legs */}
          <line x1="60" y1="35" x2="20" y2="55" className="stroke-primary" strokeWidth="8" strokeLinecap="round" />
          {/* Feet */}
          <circle cx="15" cy="58" r="5" className="fill-primary" />
        </g>
      </svg>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes pushup {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(15deg);
          }
        }
        :global(.animate-pushup) {
          animation: pushup 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// Form tips for each exercise
const exerciseTips: Record<string, string[]> = {
  pushups: [
    "Keep your body in a straight line from head to heels",
    "Position hands slightly wider than shoulder-width",
    "Lower chest to near the ground, elbows at 45°",
    "Push up fully, extending arms without locking",
    "Engage your core throughout the movement",
  ],
  pullups: [
    "Grip the bar slightly wider than shoulder-width",
    "Start from a dead hang with arms fully extended",
    "Pull up until chin clears the bar",
    "Lower slowly with control",
    "Avoid swinging or using momentum",
  ],
  squats: [
    "Stand with feet shoulder-width apart",
    "Keep your chest up and back straight",
    "Lower until thighs are parallel to the ground",
    "Keep knees tracking over your toes",
    "Push through heels to stand back up",
  ],
  planks: [
    "Position forearms on the ground, elbows under shoulders",
    "Keep body in a straight line from head to heels",
    "Engage your core and squeeze glutes",
    "Don't let hips sag or pike up",
    "Breathe steadily throughout the hold",
  ],
  running: [
    "Maintain upright posture with slight forward lean",
    "Land with feet under your center of mass",
    "Keep arms at 90° and swing naturally",
    "Take shorter, quicker strides",
    "Breathe rhythmically with your steps",
  ],
}

// Placeholder animations for other exercises
function PlaceholderAnimation({ name }: { name: string }) {
  return (
    <div className="w-full h-32 flex items-center justify-center">
      <div className="text-4xl animate-bounce">
        {name === "pullups" && "💪"}
        {name === "squats" && "🦵"}
        {name === "planks" && "🧘"}
        {name === "running" && "🏃"}
        {!["pullups", "squats", "planks", "running"].includes(name) && "🏋️"}
      </div>
    </div>
  )
}

export function ExerciseAnimation({ exerciseType }: ExerciseAnimationProps) {
  const [showTips, setShowTips] = useState(false)

  const tips = exerciseTips[exerciseType] || [
    "Maintain proper form throughout",
    "Control your breathing",
    "Start with manageable intensity",
    "Rest adequately between sets",
  ]

  return (
    <div className="rounded-lg border bg-card/50 overflow-hidden">
      {/* Animation area */}
      <div className="bg-gradient-to-b from-muted/50 to-transparent p-2">
        {exerciseType === "pushups" ? <PushupAnimation /> : <PlaceholderAnimation name={exerciseType} />}
      </div>

      {/* Tips toggle */}
      <div className="px-3 pb-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setShowTips(!showTips)}
        >
          {showTips ? (
            <>
              <X className="h-3 w-3 mr-1" />
              Hide Tips
            </>
          ) : (
            <>
              <Info className="h-3 w-3 mr-1" />
              Proper Form Tips
            </>
          )}
        </Button>

        {/* Tips list */}
        {showTips && (
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary font-bold">{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
