// sw.js – Sultan47 Service Worker (safe & reliable version)
// Only precache shell; cache media/audio/images on first use

const CACHE_NAME = 'sultan47-shell-v1';      // Core app shell
const MEDIA_CACHE_NAME = 'sultan47-media-v1'; // Heavy files (audio/images)

const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.jpg',
  '/icon-512.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell');
      return cache.addAll(SHELL_FILES);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== MEDIA_CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Navigation requests → shell fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(res => res || fetch(event.request))
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Same-origin assets (images, audio, etc.)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(networkRes => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            const cacheName = url.pathname.match(/\.(mp3|jpg|jpeg)$/) ? MEDIA_CACHE_NAME : CACHE_NAME;
            caches.open(cacheName).then(cache => cache.put(event.request, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // External (CDN) → network first, cache fallback
  event.respondWith(
    fetch(event.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return res;
    }).catch(() => caches.match(event.request))
  );
});

// Allow page to force update
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
