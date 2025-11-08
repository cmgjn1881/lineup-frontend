// public/service-worker.js

const CACHE_NAME = 'lineup-cache-v3';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apple-icon-57x57.png',
  '/apple-icon-60x60.png',
  '/apple-icon-72x72.png',
  '/apple-icon-76x76.png',
  '/apple-icon-114x114.png',
  '/apple-icon-120x120.png',
  '/apple-icon-144x144.png',
  '/apple-icon-152x152.png',
  '/apple-icon-180x180.png',
  '/android-icon-192x192.png',
  '/favicon-32x32.png',
  '/favicon-96x96.png',
  '/favicon-16x16.png',
  '/favicon.ico',
  '/ms-icon-144x144.png',
  '/android-icon-512x512.png',
  '/screenshot-mobile.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.includes('@vite/client') || request.url.includes('?html-proxy')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);

      const fetchedResponsePromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && request.url.startsWith('http')) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      });

      return cachedResponse || fetchedResponsePromise;
    })
  );
});
