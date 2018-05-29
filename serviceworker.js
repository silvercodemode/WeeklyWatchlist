const cacheName = 'weeklyWatchlist'
const baseUrl = '/WeeklyWatchlist/'

self.addEventListener('install', e => {
    e.waitUntil(caches.open(cacheName)
        .then(cache => {
            console.log('Cache opened')
            return cache.addAll([
                baseUrl,
                `${baseUrl}index.html`,
                `${baseUrl}style.css`,
                `${baseUrl}main.js`
            ])
        })
        .catch(error => console.log(error))
    )
})

self.addEventListener('fetch', e => {
    caches.open(cacheName)
        .then(cache => cache.match(e.request))
        .then(response => {
            return response || fetch(e.request)
        })
})