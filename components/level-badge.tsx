import { getLevelTier, getTierIcon, isMilestone } from "@/lib/level-system"

interface LevelBadgeProps {
  level: number
  size?: "sm" | "md" | "lg"
  showTier?: boolean
}

export function LevelBadge({ level, size = "md", showTier = false }: LevelBadgeProps) {
  const tier = getLevelTier(level)
  const tierIcon = getTierIcon(tier.name)
  const milestone = isMilestone(level)

  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-28 h-28 text-4xl",
  }

  const iconSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  }

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      {/* Main badge */}
      <div className="relative">
        {/* Outer glow for milestones */}
        {milestone && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r ${tier.color} blur-md opacity-60 animate-pulse`}
          />
        )}

        {/* Badge container */}
        <div
          className={`${sizeClasses[size]} relative rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20`}
        >
          {/* Inner shine */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/30 to-transparent" />

          {/* Level number */}
          <span className="relative z-10 drop-shadow-lg">{level}</span>

          {/* Tier icon badge */}
          <div
            className={`absolute -top-1 -right-1 ${iconSizes[size]} bg-background rounded-full p-1 shadow-md border border-border`}
          >
            {tierIcon}
          </div>
        </div>
      </div>

      {/* Tier name label */}
      {showTier && (
        <div
          className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${tier.color} text-white text-xs font-bold uppercase tracking-wider shadow-sm`}
        >
          {tier.name}
        </div>
      )}
    </div>
  )
}
