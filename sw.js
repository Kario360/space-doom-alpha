const CACHE = "cluck-invaders-v17";
const ASSETS = [
  "./",
  "./index.html",
  "./leaderboard.html",
  "./manifest.webmanifest",
  "./cover.png",
  "./launch-splash.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./Shooter Synthwave 1.mp3",
  "./Shooter Synthwave 5.mp3"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  const isPageRequest = e.request.mode === "navigate" || e.request.headers.get("accept")?.includes("text/html");

  if (isPageRequest) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, copy)).catch(() => {});
        return res;
      });
    })
  );
});