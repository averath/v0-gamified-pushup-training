const CACHE_NAME = "lvl-up-3";

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

// ── Install: pre-cache core assets ───────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete caches from previous versions ───────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: network-first with cache fallback ─────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Only handle GET requests for same-origin or CDN assets
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip non-http(s) requests (e.g. chrome-extension)
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache a clone of successful responses
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() =>
        // Network failed — serve from cache if available
        caches.match(event.request)
      )
  );
});
