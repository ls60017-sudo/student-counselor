const CACHE_NAME = "student-counselor-v0.40.15-beta-update150-savereliability";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/offline.html",
  "/assets/jszip.min.js",
  "/assets/ministry-logo.png?v=127",
  "/assets/whatsapp-icon.png",
  "/assets/vendor/html2canvas.min.js",
  "/assets/vendor/jspdf.umd.min.js",
  "/assets/vendor/qrcode-generator.js",
  "/assets/fonts/sky-regular.ttf",
  "/assets/fonts/sky-bold.ttf",
  "/icons/app-icon-192.png",
  "/icons/app-icon-512.png",
  "/icons/app-icon-maskable-512.png",
  "/icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  // cache:"reload" forces every precached file to be fetched fresh from the network,
  // bypassing the browser's own HTTP cache — otherwise a long-cached image or file
  // could get baked into the new cache unchanged even right after a fresh deploy.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(APP_SHELL.map(url => fetch(new Request(url, { cache: "reload" })).then(response => cache.put(url, response))))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).pathname.startsWith("/api/")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/").then(response => response || caches.match("/offline.html"))));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});
