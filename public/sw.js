const CACHE_NAME = "clinicos-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/icon.svg",
  "/icon-192x192.png",
  "/icon-512x512.png"
];

// Install event: pre-cache critical shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event: intercept and serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Avoid caching non-GET requests or external API calls (e.g. Supabase DB requests)
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Caching strategy:
  // 1. Static Next.js Assets & fonts: Cache-first
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png");

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. Navigation & app shell routes: Network-first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // If it's a successful response and is a HTML/document request, cache it
        if (response.status === 200 && request.mode === "navigate") {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cacheCopy);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: try to serve from cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If the navigation route itself isn't cached, return the offline shell '/'
          if (request.mode === "navigate") {
            return caches.match("/");
          }
        });
      })
  );
});
