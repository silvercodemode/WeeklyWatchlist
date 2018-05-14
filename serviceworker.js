const cacheName = 'weeklyWatchlist'

self.addEventListener('install', e => {
    e.waitUntil(caches.open(cacheName).then(cache => {
        return cache.addAll([
            '/',
            '/index.html',
            '/style.css',
            '/main.js',
            '/assets/list-icon-256.png'
        ]).then(() => self.skipWaiting())
    }))
})

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim())
})

//(async () => {
self.addEventListener('fetch', e => {
    caches.open(cacheName)
        .then(cache => cache.match(e.request, {ignoreSearch: true}))
        .then(response => {
            return response || fetch(e.request)
        })
})
//})()