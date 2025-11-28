interface ProgressBarProps {
  progress: number
  showSegments?: boolean
  segmentCount?: number
}

export function ProgressBar({ progress, showSegments = true, segmentCount = 20 }: ProgressBarProps) {
  const filledSegments = Math.floor((progress / 100) * segmentCount)

  return (
    <div className="w-full">
      {/* XP Bar Container */}
      <div className="relative h-8 bg-background/80 rounded-lg border-2 border-border overflow-hidden shadow-inner">
        {/* Animated fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20" />
          {/* Animated pulse glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>

        {/* Segment lines */}
        {showSegments && (
          <div className="absolute inset-0 flex">
            {Array.from({ length: segmentCount - 1 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-background/30" />
            ))}
            <div className="flex-1" />
          </div>
        )}

        {/* Corner accents for game feel */}
        <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-primary/50 rounded-tl" />
        <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-primary/50 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-primary/50 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-primary/50 rounded-br" />
      </div>
    </div>
  )
}
