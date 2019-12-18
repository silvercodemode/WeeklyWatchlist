const cacheName = 'weeklywatchlist-cache';
const baseUrl = '/weeklywatchlist.app/';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        baseUrl,
        `${baseUrl}index.html`,
        `${baseUrl}style.css`,
        `${baseUrl}main.js`
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
