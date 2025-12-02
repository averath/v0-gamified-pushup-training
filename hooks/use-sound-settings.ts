"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "lvlup-sound-enabled"

export function useSoundSettings() {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setSoundEnabled(stored === "true")
    }
    setIsLoaded(true)
  }, [])

  const toggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem(STORAGE_KEY, String(newValue))
  }

  const setSound = (enabled: boolean) => {
    setSoundEnabled(enabled)
    localStorage.setItem(STORAGE_KEY, String(enabled))
  }

  return { soundEnabled, toggleSound, setSound, isLoaded }
}
