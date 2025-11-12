// public/service-worker.js

const CACHE_NAME = 'lineup-cache-v9'; // 💡 버전 번호를 올려줍니다.

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

  const url = new URL(request.url);

  // 💡 [핵심 수정] API 요청은 '네트워크 우선' 전략을 사용합니다.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      // 1. 네트워크에 먼저 요청을 보냅니다.
      fetch(request)
        .then((networkResponse) => {
          // 💡 [수정] 2. 요청이 성공하면, 응답을 캐시에 저장하고 앱으로 반환합니다.
          return caches.open(CACHE_NAME).then((cache) => {
            // GET 요청이고, 유효한 응답일 때만 캐시에 저장합니다. (POST, DELETE 등은 캐싱하지 않음)
            if (request.method === 'GET' && networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse; // 💡 [핵심] 받은 응답을 그대로 반환합니다.
          });
        })
        .catch(async () => {
          // 3. 네트워크 요청이 실패하면, 캐시에서 응답을 찾아 반환합니다. (오프라인 지원)
          const cachedResponse = await caches.match(request);
          return cachedResponse;
        })
    );
    return; // API 요청 처리는 여기서 종료합니다.
  }

  // 💡 [핵심 수정] 그 외의 정적 파일(JS, CSS, 이미지 등)은 '캐시 우선' 전략을 유지합니다.
  // Stale-While-Revalidate: 캐시를 먼저 보여주고, 백그라운드에서 네트워크로 업데이트
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchedResponsePromise = fetch(request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          if (request.method === 'GET' && networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
        });
        return networkResponse;
      });

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
