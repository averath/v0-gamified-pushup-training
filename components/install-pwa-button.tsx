"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Download } from "lucide-react"

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("[PWA] User choice:", outcome)

    setDeferredPrompt(null)
    setShowInstall(false)
  }

  if (!showInstall) {
    return null
  }

  return (
    <Button onClick={handleInstall} variant="outline" size="sm" className="gap-2 bg-transparent">
      <Download className="h-4 w-4" />
      Install App
    </Button>
  )
}
