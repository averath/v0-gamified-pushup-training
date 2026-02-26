"use client"

import { useEffect } from "react"

const CURRENT_CACHE_NAME = "lvl-up-v3"

/**
 * Manages the browser Cache API used by service workers / PWA runtimes.
 * Deletes all stale caches whose names start with "lvl-up-" but are not
 * the current version, and unregisters any active service workers.
 */
export function CacheManager() {
  useEffect(() => {
    async function bustCache() {
      try {
        // 1. Delete stale lvl-up-* caches, keeping the current version
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
