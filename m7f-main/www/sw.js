/* =========================================================
   الخزنة — Service Worker
   يخزّن ملفات التطبيق (الصفحة، التنسيقات، الخطوط، الأيقونات)
   بعد أول تحميل ناجح عبر الإنترنت، عشان يشتغل التطبيق
   بدون إنترنت بعد كذا مباشرة.
   ========================================================= */

const CACHE_NAME = 'khazna-cache-v2';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './fonts/cairo-arabic-400.woff2',
  './fonts/cairo-arabic-600.woff2',
  './fonts/cairo-arabic-700.woff2',
  './fonts/cairo-arabic-800.woff2',
  './fonts/cairo-latin-400.woff2',
  './fonts/cairo-latin-600.woff2',
  './fonts/cairo-latin-700.woff2',
  './fonts/cairo-latin-800.woff2',
  './assets/logo.svg',
  './assets/logo-192.png',
  './assets/logo-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first: يخدم من الكاش فورًا، ويحدّث الكاش بصمت في الخلفية إذا فيه نت
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((res) => {
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
