"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, Download, Copy, Check, Trophy, Zap } from "lucide-react"
import { getLevelTier, getTierIcon, isMilestone, getNextMilestone, getLevelProgress } from "@/lib/level-system"

interface ShareResultsDialogProps {
  username: string
  exerciseName: string
  totalReps: number
  level: number
  workoutCount: number
}

export function ShareResultsDialog({
  username,
  exerciseName,
  totalReps,
  level,
  workoutCount,
}: ShareResultsDialogProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const tier = getLevelTier(level)
  const tierIcon = getTierIcon(tier.name)
  const milestone = isMilestone(level)
  const nextMilestone = getNextMilestone(level)
  const levelData = getLevelProgress(totalReps)

  useEffect(() => {
    if (!open) return

    const timeoutId = setTimeout(() => {
      if (canvasRef.current) {
        generateShareImage()
      } else {
        setError("Canvas element not found")
      }
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [open, username, exerciseName, totalReps, level])

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  const generateShareImage = () => {
    try {
      const canvas = canvasRef.current
      if (!canvas) {
        setError("Canvas not available")
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        setError("Could not create canvas context")
        return
      }

      canvas.width = 1200
      canvas.height = 630

      // Dark gaming background with gradient
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bgGradient.addColorStop(0, "#0f0f1a")
      bgGradient.addColorStop(0.5, "#1a1a2e")
      bgGradient.addColorStop(1, "#16213e")
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Animated-style grid pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Glowing orbs in background
      const drawGlowOrb = (x: number, y: number, radius: number, color: string) => {
        const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        orbGradient.addColorStop(0, color)
        orbGradient.addColorStop(1, "transparent")
        ctx.fillStyle = orbGradient
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      }
      drawGlowOrb(150, 150, 200, "rgba(255, 107, 53, 0.15)")
      drawGlowOrb(1050, 480, 250, "rgba(0, 229, 255, 0.1)")
      drawGlowOrb(600, 315, 300, "rgba(138, 43, 226, 0.08)")

      // Main card container
      const cardX = 60
      const cardY = 60
      const cardWidth = 1080
      const cardHeight = 510

      // Card background with glassmorphism effect
      ctx.fillStyle = "rgba(30, 30, 50, 0.8)"
      drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 24)
      ctx.fill()

      // Card border glow
      ctx.strokeStyle = "rgba(255, 107, 53, 0.5)"
      ctx.lineWidth = 2
      drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 24)
      ctx.stroke()

      // Corner accents
      const accentSize = 30
      ctx.strokeStyle = "#ff6b35"
      ctx.lineWidth = 3
      // Top left
      ctx.beginPath()
      ctx.moveTo(cardX, cardY + accentSize)
      ctx.lineTo(cardX, cardY)
      ctx.lineTo(cardX + accentSize, cardY)
      ctx.stroke()
      // Top right
      ctx.beginPath()
      ctx.moveTo(cardX + cardWidth - accentSize, cardY)
      ctx.lineTo(cardX + cardWidth, cardY)
      ctx.lineTo(cardX + cardWidth, cardY + accentSize)
      ctx.stroke()
      // Bottom left
      ctx.beginPath()
      ctx.moveTo(cardX, cardY + cardHeight - accentSize)
      ctx.lineTo(cardX, cardY + cardHeight)
      ctx.lineTo(cardX + accentSize, cardY + cardHeight)
      ctx.stroke()
      // Bottom right
      ctx.beginPath()
      ctx.moveTo(cardX + cardWidth - accentSize, cardY + cardHeight)
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight)
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - accentSize)
      ctx.stroke()

      // Level badge circle
      const badgeX = 200
      const badgeY = 240
      const badgeRadius = 90

      // Badge glow
      const badgeGlow = ctx.createRadialGradient(badgeX, badgeY, 0, badgeX, badgeY, badgeRadius * 1.5)
      badgeGlow.addColorStop(0, "rgba(255, 107, 53, 0.4)")
      badgeGlow.addColorStop(1, "transparent")
      ctx.fillStyle = badgeGlow
      ctx.fillRect(badgeX - badgeRadius * 2, badgeY - badgeRadius * 2, badgeRadius * 4, badgeRadius * 4)

      // Badge background
      const badgeGradient = ctx.createLinearGradient(
        badgeX - badgeRadius,
        badgeY - badgeRadius,
        badgeX + badgeRadius,
        badgeY + badgeRadius,
      )
      badgeGradient.addColorStop(0, "#ff6b35")
      badgeGradient.addColorStop(1, "#ff8c42")
      ctx.fillStyle = badgeGradient
      ctx.beginPath()
      ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2)
      ctx.fill()

      // Badge inner shine
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
      ctx.beginPath()
      ctx.arc(badgeX, badgeY - 20, badgeRadius - 20, Math.PI, 0)
      ctx.fill()

      // Badge border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Level number
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 72px system-ui, -apple-system, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${level}`, badgeX, badgeY)

      // "LEVEL" label above badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = "bold 18px system-ui, -apple-system, sans-serif"
      ctx.fillText("LEVEL", badgeX, badgeY - badgeRadius - 20)

      // Tier badge below
      ctx.fillStyle = "#00e5ff"
      ctx.font = "bold 24px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${tierIcon} ${tier.name.toUpperCase()}`, badgeX, badgeY + badgeRadius + 35)

      // Right side content
      const contentX = 350

      // Username
      ctx.fillStyle = "#00e5ff"
      ctx.font = "bold 48px system-ui, -apple-system, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`@${username}`, contentX, 140)

      // Exercise name with total
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 64px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${totalReps.toLocaleString()}`, contentX, 220)

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.font = "500 28px system-ui, -apple-system, sans-serif"
      ctx.fillText(`Total ${exerciseName}`, contentX, 260)

      // XP Progress bar
      const barX = contentX
      const barY = 300
      const barWidth = 650
      const barHeight = 32

      // Bar background
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 8)
      ctx.fill()

      // Bar fill
      const progressWidth = (levelData.progressPercentage / 100) * barWidth
      const barGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY)
      barGradient.addColorStop(0, "#ff6b35")
      barGradient.addColorStop(1, "#ff8c42")
      ctx.fillStyle = barGradient
      drawRoundedRect(ctx, barX, barY, progressWidth, barHeight, 8)
      ctx.fill()

      // Bar shine
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
      drawRoundedRect(ctx, barX, barY, progressWidth, barHeight / 2, 8)
      ctx.fill()

      // Progress text
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.font = "500 20px system-ui, -apple-system, sans-serif"
      ctx.fillText(
        `${levelData.progressInLevel} / ${levelData.xpForNextLevel} XP to Level ${level + 1}`,
        barX,
        barY + barHeight + 30,
      )

      // Stats row
      const statsY = 420
      const statsGap = 220

      // Workouts stat
      ctx.fillStyle = "#ff6b35"
      ctx.font = "bold 42px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${workoutCount}`, contentX, statsY)
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.font = "500 18px system-ui, -apple-system, sans-serif"
      ctx.fillText("Workouts", contentX, statsY + 30)

      // Total XP stat
      ctx.fillStyle = "#00e5ff"
      ctx.font = "bold 42px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${totalReps.toLocaleString()}`, contentX + statsGap, statsY)
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.font = "500 18px system-ui, -apple-system, sans-serif"
      ctx.fillText("Total XP", contentX + statsGap, statsY + 30)

      // Next milestone stat
      ctx.fillStyle = "#a855f7"
      ctx.font = "bold 42px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${nextMilestone}`, contentX + statsGap * 2, statsY)
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.font = "500 18px system-ui, -apple-system, sans-serif"
      ctx.fillText("Next Milestone", contentX + statsGap * 2, statsY + 30)

      // Brand watermark
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.font = "bold 20px system-ui, -apple-system, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText("LVL UP FITNESS", cardX + cardWidth - 30, cardY + cardHeight - 25)

      // Milestone badge if applicable
      if (milestone) {
        ctx.fillStyle = "#fbbf24"
        ctx.font = "bold 16px system-ui, -apple-system, sans-serif"
        ctx.textAlign = "left"
        drawRoundedRect(ctx, contentX, 100, 140, 28, 14)
        ctx.fill()
        ctx.fillStyle = "#000"
        ctx.textAlign = "center"
        ctx.fillText("⭐ MILESTONE", contentX + 70, 120)
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setImageUrl(url)
          setError(null)
        } else {
          setError("Failed to generate image")
        }
      })
    } catch (err) {
      console.error("[v0] Error generating share image:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement("a")
    link.download = `lvl-up-${username}-level-${level}.png`
    link.href = imageUrl
    link.click()
  }

  const shareText = `🎮 Level ${level} ${tier.name} in ${exerciseName}! ${tierIcon}\n\n💪 ${totalReps.toLocaleString()} total XP\n🏋️ ${workoutCount} workouts completed\n\nJoin me on LVL UP Fitness!`
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/leaderboard` : ""

  const handleNativeShare = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `lvl-up-${username}-level-${level}.png`, { type: "image/png" })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "LVL UP Fitness Progress",
          text: shareText,
          files: [file],
        })
      } else {
        handleDownload()
      }
    } catch (error) {
      console.error("[v0] Error sharing:", error)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Share Your Progress
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              Error generating image: {error}
            </div>
          )}

          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden border border-border bg-card">
            <canvas ref={canvasRef} className="w-full h-auto" />
            {!imageUrl && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-4 h-4 animate-pulse" />
                  Generating image...
                </div>
              </div>
            )}
          </div>

          {/* Quick stats preview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-card border border-border">
              <span className="text-2xl font-bold text-primary">{level}</span>
              <span className="text-xs text-muted-foreground">Level</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-card border border-border">
              <span className="text-2xl font-bold text-accent">{totalReps.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Total XP</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-card border border-border">
              <span className="text-2xl font-bold text-purple-500">{workoutCount}</span>
              <span className="text-xs text-muted-foreground">Workouts</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleNativeShare} className="gap-2" disabled={!imageUrl}>
              <Share2 className="w-4 h-4" />
              Share Image
            </Button>
            <Button onClick={handleDownload} variant="outline" className="gap-2 bg-transparent" disabled={!imageUrl}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Share on social media</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(twitterUrl, "_blank")}
                className="gap-2 hover:bg-[#1da1f2]/10 hover:border-[#1da1f2]/50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(facebookUrl, "_blank")}
                className="gap-2 hover:bg-[#1877f2]/10 hover:border-[#1877f2]/50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(whatsappUrl, "_blank")}
                className="gap-2 hover:bg-[#25d366]/10 hover:border-[#25d366]/50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <Button variant="outline" onClick={handleCopyLink} className="w-full gap-2 bg-transparent">
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Link Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Leaderboard Link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
