"use client"

import { useEffect } from "react"

const CURRENT_CACHE_NAME = "lvl-up-3"

/**
 * Registers the service worker and cleans up any stale caches whose names
 * start with "lvl-up-" but are not the current version.
 */
export function CacheManager() {
  useEffect(() => {
    async function initServiceWorker() {
      try {
        // 1. Register the service worker
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          })
          console.log("[CacheManager] Service worker registered:", registration.scope)
        }

        // 2. Delete stale lvl-up-* caches, keeping the current version
        if ("caches" in window) {
          const cacheNames = await caches.keys()
          const staleCaches = cacheNames.filter(
            (name) => name.startsWith("lvl-up-") && name !== CURRENT_CACHE_NAME
          )
          await Promise.all(staleCaches.map((name) => caches.delete(name)))
          if (staleCaches.length > 0) {
            console.log("[CacheManager] Cleared stale caches:", staleCaches)
          }
        }
      } catch (err) {
        console.warn("[CacheManager] Service worker setup failed:", err)
      }
    }

    initServiceWorker()
  }, [])

  return null
}
