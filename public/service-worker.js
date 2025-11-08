// public/service-worker.js

const CACHE_NAME = 'lineup-cache-v2';
// 💡 캐싱할 파일 목록입니다. 앱의 '껍데기'에 해당하는 필수 파일들을 포함합니다.
// 빌드 도구(Vite, Webpack)의 PWA 플러그인을 사용하면 이 목록이 자동으로 관리됩니다.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // index.html에 명시된 모든 아이콘 파일들을 캐싱 목록에 추가합니다.
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
  '/android-icon-512x512.png', // manifest.json에서 참조하므로 유지합니다.
  '/screenshot-mobile.png',
  // 여기에 빌드 후 생성되는 JS, CSS 파일 경로를 추가하면 더 좋습니다.
  // 예: '/assets/index-*.js', '/assets/index-*.css'
];

// 1. 서비스 워커 설치 (install 이벤트)
// 앱의 핵심 자원(App Shell)을 캐시에 저장합니다.
self.addEventListener('install', (event) => {
  // waitUntil: 이 작업이 끝날 때까지 서비스 워커가 설치된 것으로 간주하지 않습니다.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. 네트워크 요청 가로채기 (fetch 이벤트)
// 모든 네트워크 요청은 서비스 워커를 거칩니다.
self.addEventListener('fetch', (event) => {
  // 💡 [수정] Vite의 HMR WebSocket 요청은 서비스 워커가 가로채지 않도록 합니다.
  // WebSocket 요청은 일반적인 fetch가 아니므로, 캐싱 전략에서 제외해야 합니다.
  if (event.request.url.includes('?html-proxy') || event.request.url.includes('@vite/client')) {
    return;
  }

  // respondWith: 브라우저의 기본 fetch 동작을 막고, 우리가 제공하는 응답으로 대체합니다.
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Case 1: 캐시에 요청과 일치하는 응답이 있는 경우
      if (response) {
        return response; // 캐시된 응답을 즉시 반환 (오프라인 지원의 핵심)
      }

      // Case 2: 캐시에 응답이 없는 경우
      // 네트워크에 직접 요청을 보냅니다.
      return fetch(event.request).then((response) => {
        // 💡 [수정] chrome-extension://과 같은 요청은 캐싱하지 않도록 예외 처리합니다.
        if (!event.request.url.startsWith('http')) {
          return response;
        }

        // 유효한 응답인지 확인 (200 OK)
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 응답을 복제합니다. 응답 스트림은 한 번만 사용할 수 있기 때문입니다.
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // 네트워크에서 받은 응답을 다음을 위해 캐시에 저장합니다.
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// 3. 오래된 캐시 정리 (activate 이벤트)
// 새 버전의 서비스 워커가 활성화될 때, 이전 버전의 캐시를 삭제합니다.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // 유지할 캐시 목록
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
});
