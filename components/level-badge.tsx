import { Trophy } from "lucide-react"

interface LevelBadgeProps {
  level: number
  size?: "sm" | "md" | "lg"
}

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const sizeClasses = {
    sm: "w-16 h-16 text-xl",
    md: "w-24 h-24 text-3xl",
    lg: "w-32 h-32 text-5xl",
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/50 animate-pulse-slow`}
      >
        {level}
      </div>
      <Trophy className="absolute -top-2 -right-2 w-6 h-6 text-accent" />
    </div>
  )
}
