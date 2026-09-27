// Scoreboard service worker — network-first with cache fallback.
// Always try the network so an installed app picks up new versions immediately;
// fall back to the cached copy when offline. Bump CACHE_NAME on breaking changes.
const CACHE_NAME = 'scoreboard-v3';
const PRECACHE = [
  './',
  './index.html',
  './universal_scoreboard_pwa.html',
  './manifest.webmanifest',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Precache what we can; don't fail the install if one asset is missing.
      Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {})))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok && new URL(e.request.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./universal_scoreboard_pwa.html')))
  );
});
