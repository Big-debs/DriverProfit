const CACHE = 'driverprofit-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    // Network-first for navigation, cache-first for assets
    const isNav = e.request.mode === 'navigate';
    e.respondWith(
        isNav
            ? fetch(e.request).catch(() => caches.match('/index.html'))
            : caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
                const clone = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
                return res;
              }))
    );
});
