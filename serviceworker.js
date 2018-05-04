const cacheName = 'weeklyWatchlist'

self.addEventListener('install', e => {
    e.waitUntil(caches.open(cacheName).then(cache => {
        const timeStamp = Date.now()
        return cache.addAll([
            '/',
            `/index.html?timestamp=${timeStamp}`,
            `/style.css?timestamp=${timeStamp}`,
            `/main.js?timestamp=${timeStamp}`,
            `/assets/list-icon-256.png?timestamp=${timeStamp}`
        ]).then(() => self.skipWaiting())
    }))
})

self.addEventListener('activate', e => {
    e.waitUntil(self.clients.claim())
})

//(async () => {
self.addEventListener('fetch', e => {
    console.log(e.request.url)
    caches.open(cacheName)
        .then(cache => cache.match(e.request, {ignoreSearch: true}))
        .then(response => {
            return response || fetch(e.request)
        })
})
//})()