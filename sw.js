// sw.js - Sultan47 v4 - FULL OFFLINE (all cores + backgrounds + audio precached)
const CACHE_NAME = 'sultan47-v4';

const PRECACHE_FILES = [
  '/', '/index.html', '/manifest.json',
  '/icon-192.jpg', '/icon-512.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.180.0/three.min.js',

  // === AUDIO ===
  '1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3',

  // === CORE TEXTURES ===
  'assets/core/a.jpg', 'assets/core/aa.jpg', 'assets/core/aaa.jpg', 'assets/core/aaaa.jpg', 'assets/core/aaaaa.jpg',
  'assets/core/b.jpg', 'assets/core/bb.jpg', 'assets/core/bbb.jpg', 'assets/core/bbbb.jpg', 'assets/core/bbbbb.jpg',
  'assets/core/c.jpg', 'assets/core/cc.jpg', 'assets/core/ccc.jpg', 'assets/core/cccc.jpg', 'assets/core/ccccc.jpg',
  'assets/core/d.jpeg', 'assets/core/dd.jpeg', 'assets/core/ddd.jpeg', 'assets/core/dddd.jpeg', 'assets/core/ddddd.jpeg',
  'assets/core/e.jpeg', 'assets/core/ee.jpeg', 'assets/core/eee.jpeg', 'assets/core/eeee.jpeg', 'assets/core/eeeee.jpeg',

  // === BACKGROUNDS ===
  'assets/bg/1.jpg', 'assets/bg/11.jpg', 'assets/bg/111.jpg', 'assets/bg/1111.jpg', 'assets/bg/11111.jpg',
  'assets/bg/2.jpg', 'assets/bg/22.jpg', 'assets/bg/222.jpg', 'assets/bg/2222.jpg', 'assets/bg/22222.jpg',
  'assets/bg/3.jpg', 'assets/bg/33.jpg', 'assets/bg/333.jpg', 'assets/bg/3333.jpg', 'assets/bg/33333.jpg',
  'assets/bg/4.jpg', 'assets/bg/44.jpg', 'assets/bg/444.jpg', 'assets/bg/4444.jpeg', 'assets/bg/44444.jpeg',
  'assets/bg/5.jpeg', 'assets/bg/55.jpeg', 'assets/bg/555.jpeg', 'assets/bg/5555.jpeg', 'assets/bg/55555.jpeg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll(PRECACHE_FILES).then(() => self.skipWaiting())
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(networkRes => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return networkRes;
      }).catch(() => {
        // Offline fallback for navigation
        if (e.request.mode === 'navigate') return caches.match('/index.html');
        return null;
      });
    })
  );
});
