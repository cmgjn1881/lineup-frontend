// public/service-worker.js

const CACHE_NAME = 'lineup-cache-v13'; // 💡 버전 번호를 올려줍니다.

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
  '/apple-icon-180x180.v2.png',
  '/android-icon-192x192.v2.png',
  '/favicon-32x32.png',
  '/favicon-96x96.png',
  '/favicon-16x16.png',
  '/favicon.ico',
  '/ms-icon-144x144.png',
  '/android-icon-512x512.v2.png',
  '/screenshot-mobile.v2.png',
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

// 💡 [추가] activate 이벤트: 오래된 캐시를 정리합니다.
// 새 서비스 워커가 활성화될 때, 현재 CACHE_NAME과 다른 이름을 가진 이전 캐시들을 모두 삭제합니다.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 즉시 클라이언트를 제어하도록 합니다.
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.includes('@vite/client') || request.url.includes('?html-proxy')) {
    return;
  }

  const url = new URL(request.url);

  // 💡 [핵심 수정] API 요청은 캐싱 전략에서 제외하고, 항상 네트워크를 통해 요청합니다.
  if (url.pathname.startsWith('/api/')) {
    // 아무것도 하지 않고 return하면 서비스 워커는 이 요청을 무시하고,
    // 브라우저는 일반적인 방식으로 네트워크 요청을 보냅니다.
    return;
  }

  // 💡 [핵심 수정] 'Stale-While-Revalidate' 전략을 더 명확하게 구현합니다.
  // 캐시된 응답이 있으면 즉시 반환하고, 동시에 네트워크 요청을 보내 캐시를 업데이트합니다.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // 네트워크 요청을 항상 보냅니다.
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // 응답이 유효하면 캐시를 업데이트합니다.
          // 응답을 복제(clone)해야 캐시에도 저장하고 브라우저에도 전달할 수 있습니다.
          if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.error('Service Worker: Fetch failed:', err);
        });

      // 캐시된 응답이 있으면 그것을 먼저 반환하고, 없으면 네트워크 응답을 기다립니다.
      return cachedResponse || fetchPromise;
    })
  );
});
