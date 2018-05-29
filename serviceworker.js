const cacheName = 'weeklyWatchlist'

self.addEventListener('install', e => {
    e.waitUntil(caches.open(cacheName)
        .then(cache => {
            console.log('Cache opened')
            return cache.addAll([
                '/WeeklyWatchlist/',
                '/WeeklyWatchlist/index.html',
                '/WeeklyWatchlist/style.css',
                '/WeeklyWatchlist/main.js'
            ])
        }))
        .catch(error => console.log(error))
})

self.addEventListener('fetch', e => {
    caches.open(cacheName)
        .then(cache => cache.match(e.request))
        .then(response => {
            return response || fetch(e.request)
        })
})