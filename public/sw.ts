declare const self: ServiceWorkerGlobalScope

const CACHE_NAME = "pushup-track-v1"
const ASSETS_TO_CACHE = ["/", "/dashboard", "/leaderboard", "/stats", "/offline"]

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        console.log("[SW] Some assets could not be cached during install")
      })
    }),
  )
})

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    }),
  )
})

self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and external requests
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return
  }

  // Network first for API calls
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const cache = caches.open(CACHE_NAME)
            cache.then((c) => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return (
              cached ||
              new Response(JSON.stringify({ error: "offline" }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
              })
            )
          })
        }),
    )
    return
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((response) => {
            if (response.ok && request.method === "GET") {
              const cache = caches.open(CACHE_NAME)
              cache.then((c) => c.put(request, response.clone()))
            }
            return response
          })
          .catch(() => {
            return new Response("Offline", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            })
          })
      )
    }),
  )
})
