const CACHE_NAME = 'quizhero-v62';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/themes.js',
  './js/bosses-svg.js',
  './js/profiles.js',
  './js/questions.js',
  './js/progression.js',
  './js/app.js',
  './js/duel.js',
  './js/firebase.js',
  './js/sync.js',
  './js/fiches.js',
  './js/dailyQuests.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Only cache same-origin assets — never cache Firebase/CDN responses (stale data risk)
  const isSameOrigin = url.origin === self.location.origin;

  e.respondWith(
    fetch(e.request).then(response => {
      if (isSameOrigin) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});
