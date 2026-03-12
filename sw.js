// sw.js – SULTAN47 Service Worker
// Updated: includes every referenced asset for full offline caching

const CACHE_NAME = 'Sultan47';

// Core page + libraries
const PRECACHE_FILES = [
  // Main document
  '/',
  '/index.html',

  // Three.js (CDN – will be cached on first load)
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',

  // Icons (make sure these files actually exist in root)
  '/icon-192.jpg',
  '/icon-512.jpg',

  // All audio tracks
  '/1.mp3',
  '/2.mp3',
  '/3.mp3',
  '/4.mp3',
  '/5.mp3',

  // All core textures (5 tracks × 5 variants each)
  '/assets/core/a.jpg',
  '/assets/core/aa.jpg',
  '/assets/core/aaa.jpg',
  '/assets/core/aaaa.jpg',
  '/assets/core/aaaaa.jpg',

  '/assets/core/b.jpg',
  '/assets/core/bb.jpg',
  '/assets/core/bbb.jpg',
  '/assets/core/bbbb.jpg',
  '/assets/core/bbbbb.jpg',

  '/assets/core/c.jpg',
  '/assets/core/cc.jpg',
  '/assets/core/ccc.jpg',
  '/assets/core/cccc.jpg',
  '/assets/core/ccccc.jpg',

  '/assets/core/d.jpeg',
  '/assets/core/dd.jpeg',
  '/assets/core/ddd.jpeg',
  '/assets/core/dddd.jpeg',
  '/assets/core/ddddd.jpeg',

  '/assets/core/e.jpeg',
  '/assets/core/ee.jpeg',
  '/assets/core/eee.jpeg',
  '/assets/core/eeee.jpeg',
  '/assets/core/eeeee.jpeg',

  // All background images (5 tracks × 5 variants each)
  '/assets/bg/1.jpg',
  '/assets/bg/11.jpg',
  '/assets/bg/111.jpg',
  '/assets/bg/1111.jpg',
  '/assets/bg/11111.jpg',

  '/assets/bg/2.jpg',
  '/assets/bg/22.jpg',
  '/assets/bg/222.jpg',
  '/assets/bg/2222.jpg',
  '/assets/bg/22222.jpg',

  '/assets/bg/3.jpg',
  '/assets/bg/33.jpg',
  '/assets/bg/333.jpg',
  '/assets/bg/3333.jpg',
  '/assets/bg/33333.jpg',

  '/assets/bg/4.jpg',
  '/assets/bg/44.jpg',
  '/assets/bg/444.jpg',
  '/assets/bg/4444.jpeg',
  '/assets/bg/44444.jpeg',

  '/assets/bg/5.jpeg',
  '/assets/bg/55.jpeg',
  '/assets/bg/555.jpeg',
  '/assets/bg/5555.jpeg',
  '/assets/bg/55555.jpeg'
];

// On install: cache everything listed above
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[sw] Pre-caching all core assets');
        return cache.addAll(PRECACHE_FILES)
          .catch(err => {
            console.warn('[sw] Some assets failed to cache during install:', err);
            // Continue anyway – partial cache is still useful
          });
      })
      .then(() => self.skipWaiting())
  );
});

// On activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy: Cache-first for same-origin assets, Network-first + cache for external
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET or non-http(s) requests
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Same-origin → Cache-first (fast offline experience)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          // Return cache if found
          if (cached) return cached;

          // Otherwise fetch from network and cache successful response
          return fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return networkResponse;
          }).catch(() => {
            // Offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            // For other assets → return nothing or placeholder if you have one
          });
        })
    );
    return;
  }

  // External resources (CDN, etc.) → Network-first + fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

// Optional: listen for messages from client (e.g. to force update)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
