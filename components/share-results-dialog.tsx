"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, Download, Copy, Check } from "lucide-react"

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

  useEffect(() => {
    if (open && canvasRef.current) {
      console.log("[v0] Generating share image...")
      generateShareImage()
    }
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
        console.log("[v0] Canvas ref not available")
        setError("Canvas not available")
        return
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.log("[v0] Could not get canvas context")
        setError("Could not create canvas context")
        return
      }

      console.log("[v0] Canvas context obtained, starting drawing...")

      // Set canvas size
      canvas.width = 1200
      canvas.height = 630

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#0a0a0a")
      gradient.addColorStop(1, "#1a1a1a")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Accent gradient overlay
      const accentGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
      )
      accentGradient.addColorStop(0, "rgba(255, 107, 53, 0.15)")
      accentGradient.addColorStop(1, "rgba(0, 229, 255, 0.1)")
      ctx.fillStyle = accentGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Brand
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 48px system-ui, -apple-system, sans-serif"
      ctx.fillText("LEVEL FITNESS", 80, 100)

      // Level badge
      ctx.fillStyle = "#ff6b35"
      drawRoundedRect(ctx, 80, 180, 200, 120, 16)
      ctx.fill()

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 72px system-ui, -apple-system, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${level}`, 180, 265)

      ctx.font = "600 24px system-ui, -apple-system, sans-serif"
      ctx.fillText("LEVEL", 180, 150)

      // Stats
      ctx.textAlign = "left"
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 64px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${totalReps.toLocaleString()}`, 350, 240)

      ctx.fillStyle = "#a0a0a0"
      ctx.font = "500 32px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${exerciseName}`, 350, 290)

      // Username
      ctx.fillStyle = "#00e5ff"
      ctx.font = "600 40px system-ui, -apple-system, sans-serif"
      ctx.fillText(`@${username}`, 80, 450)

      // Workout count
      ctx.fillStyle = "#ffffff"
      ctx.font = "500 28px system-ui, -apple-system, sans-serif"
      ctx.fillText(`${workoutCount} workouts completed`, 80, 510)

      console.log("[v0] Canvas drawing complete, converting to blob...")

      // Convert to blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setImageUrl(url)
          setError(null)
          console.log("[v0] Image generated successfully:", url)
        } else {
          console.log("[v0] Failed to create blob")
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
    link.download = `level-fitness-${username}.png`
    link.href = imageUrl
    link.click()
  }

  const shareText = `I'm Level ${level} in ${exerciseName} with ${totalReps.toLocaleString()} total reps! 💪 Join me on Level Fitness!`
  const shareUrl = typeof window !== "undefined" ? window.location.origin : ""

  const handleNativeShare = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `level-fitness-${username}.png`, { type: "image/png" })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Level Fitness Progress",
          text: shareText,
          files: [file],
        })
      } else {
        // Fallback to download
        handleDownload()
      }
    } catch (error) {
      console.error("[v0] Error sharing:", error)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Your Progress</DialogTitle>
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
                <div className="text-muted-foreground">Generating image...</div>
              </div>
            )}
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
              <Button variant="outline" size="sm" onClick={() => window.open(twitterUrl, "_blank")} className="gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(facebookUrl, "_blank")} className="gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(whatsappUrl, "_blank")} className="gap-2">
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
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
