const CACHE_NAME = 'quizhero-v14';
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
  e.respondWith(
    fetch(e.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      return response;
    }).catch(() => caches.match(e.request))
  );
});
