const FY_CACHE = 'for-you-v46';
const FY_ESSENCIAIS = [
  './',
  './index.html',
  './manifest.json',
  './icone-for-you-192.png',
  './icone-for-you-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(FY_CACHE)
      .then(cache => cache.addAll(FY_ESSENCIAIS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== FY_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(FY_CACHE).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(FY_CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
