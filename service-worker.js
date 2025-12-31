const CACHE_NAME = 'lego-drawer-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 安裝 Service Worker 並快取靜態資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 啟用新的 Service Worker 並清理舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 攔截請求
self.addEventListener('fetch', (event) => {
  // 對於 API 請求 (Firebase, Brickognize, Gemini)，直接走網絡，不快取
  if (event.request.url.includes('firestore') || 
      event.request.url.includes('googleapis') || 
      event.request.url.includes('brickognize')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果快取有，就用快取；否則走網絡
      return response || fetch(event.request).then((networkResponse) => {
        // 如果是有效的網絡回應，也可以選擇動態加入快取 (這邊簡單處理，只回傳)
        return networkResponse;
      });
    })
  );
});