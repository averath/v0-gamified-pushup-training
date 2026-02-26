"use client"

import { useEffect } from "react"

/**
 * Clears all entries from the browser Cache API (used by service workers /
 * PWA runtimes) so that stale assets are evicted on the next page load.
 * Also unregisters any active service workers so the fresh network response
 * is served immediately.
 */
export function CacheManager() {
  useEffect(() => {
    async function bustCache() {
      try {
        // 1. Delete every named cache in the Cache Storage API
        if ("caches" in window) {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map((name) => caches.delete(name)))
          if (cacheNames.length > 0) {
            console.log("[CacheManager] Cleared caches:", cacheNames)
          }
        }

        // 2. Unregister stale service workers so the browser uses the
        //    network directly on the next navigation.
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations.map((reg) => reg.unregister()))
          if (registrations.length > 0) {
            console.log("[CacheManager] Unregistered service workers:", registrations.length)
          }
        }
      } catch (err) {
        console.warn("[CacheManager] Cache bust failed:", err)
      }
    }

    bustCache()
  }, [])

  return null
}
