self.addEventListener('install', e => {
    e.waitUntil(caches.open('airhorner').then(cache => {
        return cache.addAll([
            '/',
            '/index.html',
            '/styles.css',
            '/main.js',
            '/assets/list-icon-256.png'
        ])
    }))
})

self.addEventListener('fetch', e => {
    console.log(e.request.url)
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request)
        })
    )
})