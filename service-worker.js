/* For You: apenas a estrutura pública é mantida para abrir a loja sem conexão.
   Pedidos, contas, pagamentos, API e imagens externas nunca entram neste cache. */
const CACHE = 'for-you-shell-v1-20260924';
const SHELL = ['./', './manifest.json', './icone-for-you-192.png', './icone-for-you-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(SHELL.map(url => cache.add(url)))));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('for-you-shell-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (/\/(?:auth|rest|functions)\/|pagbank|checkout|pedido/i.test(url.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok && url.pathname === new URL('./', self.registration.scope).pathname) {
        const copy=response.clone();caches.open(CACHE).then(cache => cache.put('./', copy));
      }
      return response;
    }).catch(async () => (await caches.match('./')) || Response.error()));
    return;
  }
  if (SHELL.some(path => new URL(path, self.registration.scope).href === url.href)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});
