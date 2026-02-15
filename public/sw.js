// Service Worker for LVL UP PWA
const CACHE_NAME = "lvl-up-v1"
const urlsToCache = ["/", "/dashboard", "/leaderboard", "/stats"]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    caches.match(event.request).then(async (cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      try {
        // Clone request and explicitly follow redirects
        const networkResponse = await fetch(event.request.clone(), {
          redirect: 'follow'
        })

        // Don't cache redirects (type 'opaqueredirect' or non-200)
        if (networkResponse.ok && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }

        return networkResponse
      } catch (error) {
        console.log('[SW] Fetch failed:', error)
        // Optional: Return a fallback offline page
        return caches.match('/')
      }
    })
  )
})
