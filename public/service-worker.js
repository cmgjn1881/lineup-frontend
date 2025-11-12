// public/service-worker.js
const CACHE_NAME = 'lineup-cache-v7'; // 💡 버전 번호를 올려줍니다.

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

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.includes('@vite/client') || request.url.includes('?html-proxy')) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. 캐시에서 응답을 먼저 찾아봅니다.
      const cachedResponse = await cache.match(request);

      // 2. 네트워크에서 최신 리소스를 가져옵니다.
      const fetchedResponsePromise = fetch(request)
        .then((networkResponse) => {
          // 유효한 응답일 경우에만 캐시에 저장합니다.
          if (networkResponse && networkResponse.status === 200 && request.url.startsWith('http')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => {
          // 이 경우 cachedResponse가 반환됩니다.
        });

      // 3. 캐시된 응답이 있으면 즉시 반환하고(빠른 로딩), 없으면 네트워크 응답을 기다립니다.
      return cachedResponse || fetchedResponsePromise;
    })
  );
});

// 새 버전의 서비스 워커가 활성화될 때, 이전 버전의 캐시를 삭제합니다.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // 유지할 캐시 목록 (현재 버전)
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // 화이트리스트에 없는 캐시는 삭제
          }
        })
      )
    )
  );
  // 서비스 워커가 활성화될 때, 현재 열려있는 모든 클라이언트(페이지)의 제어권을 즉시 가져옵니다.
  return self.clients.claim();
});

// [추가] 앱으로부터 캐시 삭제 메시지를 수신하는 리스너
self.addEventListener('message', (event) => {
  // 'CLEAR_CACHE' 타입의 메시지를 받았을 때만 동작
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    const urlToClear = event.data.url;
    if (!urlToClear) return;

    // URL을 절대 경로로 변환 (예: '/api/teams' -> 'https://.../api/teams')
    const fullUrl = new URL(urlToClear, self.location.origin).href;

    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log(`[Service Worker] 캐시 삭제 시도: ${fullUrl}`);
        // 지정된 URL에 해당하는 캐시를 삭제합니다.
        return cache.delete(fullUrl);
      })
    );
  }
});
