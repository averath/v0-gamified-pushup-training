"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, CameraOff, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/language-context"

interface CameraRepCounterProps {
  exerciseName: string
  onLogReps?: (count: number) => void
  disabled?: boolean
}

type Status = "idle" | "loading" | "running" | "error"

// Keypoints whose averaged vertical position tracks the up/down motion of a rep.
const TRACKED_KEYPOINTS = ["left_shoulder", "right_shoulder", "left_hip", "right_hip"]
const MIN_KEYPOINT_SCORE = 0.3
// Fraction of the frame height the body must travel before reps are counted.
const MIN_RANGE = 0.08
// How fast the adaptive min/max envelope relaxes toward the current signal each frame.
const RELAX_RATE = 0.0008

export function CameraRepCounter({ exerciseName, onLogReps, disabled }: CameraRepCounterProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const detectorRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const adjacentPairsRef = useRef<number[][]>([])

  // Rep-detection state kept in refs so the animation loop reads fresh values.
  const phaseRef = useRef<"up" | "down">("up")
  const smoothYRef = useRef<number | null>(null)
  const minYRef = useRef<number>(1)
  const maxYRef = useRef<number>(0)
  const repsRef = useRef(0)

  const [reps, setReps] = useState(0)
  const [status, setStatus] = useState<Status>("idle")
  const [hint, setHint] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (detectorRef.current) {
      detectorRef.current.dispose()
      detectorRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStatus("idle")
  }, [])

  // Tear down the camera + model when the component unmounts.
  useEffect(() => () => stop(), [stop])

  const resetCount = useCallback(() => {
    repsRef.current = 0
    phaseRef.current = "up"
    smoothYRef.current = null
    minYRef.current = 1
    maxYRef.current = 0
    setReps(0)
  }, [])

  const updateCount = useCallback((keypoints: any[]) => {
    const tracked = keypoints.filter(
      (kp) => TRACKED_KEYPOINTS.includes(kp.name) && (kp.score ?? 0) >= MIN_KEYPOINT_SCORE,
    )
    if (tracked.length < 2) {
      setHint(t.camera.hintUpperBody)
      return
    }

    const video = videoRef.current
    const height = video?.videoHeight || 1
    const rawY = tracked.reduce((sum, kp) => sum + kp.y, 0) / tracked.length / height

    smoothYRef.current = smoothYRef.current === null ? rawY : smoothYRef.current * 0.6 + rawY * 0.4
    const y = smoothYRef.current

    // Adaptive envelope: track the recent low/high of the signal, relaxing inward
    // so the thresholds follow the user's actual range of motion.
    minYRef.current = Math.min(y, minYRef.current + RELAX_RATE)
    maxYRef.current = Math.max(y, maxYRef.current - RELAX_RATE)
    const range = maxYRef.current - minYRef.current

    if (range < MIN_RANGE) {
      setHint(t.camera.hintMove)
      return
    }

    setHint("")
    const highThreshold = minYRef.current + range * 0.7
    const lowThreshold = minYRef.current + range * 0.3

    if (phaseRef.current === "up" && y > highThreshold) {
      phaseRef.current = "down"
    } else if (phaseRef.current === "down" && y < lowThreshold) {
      phaseRef.current = "up"
      repsRef.current += 1
      setReps(repsRef.current)
    }
  }, [t])

  const draw = useCallback((keypoints: any[]) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 2
    for (const [i, j] of adjacentPairsRef.current) {
      const a = keypoints[i]
      const b = keypoints[j]
      if ((a?.score ?? 0) < MIN_KEYPOINT_SCORE || (b?.score ?? 0) < MIN_KEYPOINT_SCORE) continue
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }

    ctx.fillStyle = "#4ade80"
    for (const kp of keypoints) {
      if ((kp.score ?? 0) < MIN_KEYPOINT_SCORE) continue
      ctx.beginPath()
      ctx.arc(kp.x, kp.y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  const start = useCallback(async () => {
    setErrorMessage("")
    setStatus("loading")
    resetCount()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error("Video element unavailable")
      video.srcObject = stream
      await video.play()

      // Lazy-load the ML stack so it never ships in the initial dashboard bundle.
      const tf = await import("@tensorflow/tfjs-core")
      await import("@tensorflow/tfjs-backend-webgl")
      const poseDetection = await import("@tensorflow-models/pose-detection")

      await tf.setBackend("webgl")
      await tf.ready()

      const model = poseDetection.SupportedModels.MoveNet
      adjacentPairsRef.current = poseDetection.util.getAdjacentPairs(model)
      detectorRef.current = await poseDetection.createDetector(model, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      })

      setStatus("running")

      const loop = async () => {
        const detector = detectorRef.current
        const currentVideo = videoRef.current
        if (!detector || !currentVideo) return
        try {
          const poses = await detector.estimatePoses(currentVideo, { flipHorizontal: false })
          if (poses[0]?.keypoints) {
            updateCount(poses[0].keypoints)
            draw(poses[0].keypoints)
          } else {
            setHint(t.camera.hintNoPerson)
          }
        } catch {
          // Ignore transient per-frame estimation errors and keep the loop alive.
        }
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
    } catch (err) {
      console.error("Camera rep counter failed to start:", err)
      setErrorMessage(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? t.camera.permissionDenied
          : t.camera.startError,
      )
      setStatus("error")
      stop()
    }
  }, [draw, resetCount, stop, updateCount, t])

  const isRunning = status === "running"

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />

        {status !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-center text-sm text-muted-foreground">
            {status === "loading" ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
                <span>{t.camera.loadingModel}</span>
              </>
            ) : status === "error" ? (
              <span className="px-6 text-destructive">{errorMessage}</span>
            ) : (
              <>
                <Camera className="h-6 w-6 text-accent" />
                <span>{t.camera.prompt}</span>
              </>
            )}
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-lg bg-background/80 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-3xl font-bold tabular-nums text-foreground">{reps}</span>
          <span className="ml-2 text-xs uppercase tracking-wider text-muted-foreground">{t.camera.reps}</span>
        </div>

        {isRunning && hint && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            {hint}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {isRunning ? (
          <Button variant="outline" onClick={stop} className="gap-2">
            <CameraOff className="h-4 w-4" />
            {t.camera.stop}
          </Button>
        ) : (
          <Button onClick={start} disabled={status === "loading"} className="gap-2">
            <Camera className="h-4 w-4" />
            {status === "loading" ? t.camera.starting : t.camera.start}
          </Button>
        )}

        <Button variant="outline" onClick={resetCount} disabled={reps === 0} className="gap-2 bg-transparent">
          <RotateCcw className="h-4 w-4" />
          {t.camera.reset}
        </Button>

        {onLogReps && (
          <Button
            onClick={() => onLogReps(reps)}
            disabled={disabled || reps === 0}
            className="gap-2"
          >
            {t.camera.log} {reps} {exerciseName}
          </Button>
        )}
      </div>
    </div>
  )
}
