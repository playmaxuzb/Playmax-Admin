// PLAYMAX Admin: network first for code so updates arrive at once; GitHub API calls are never cached.
const CACHE = 'playmax-admin-v7';
const SHELL = ['./', './index.html', './core.js', './manifest.webmanifest', './assets/logo-circle.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('playmax-admin-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const isImg = /\.(webp|png|jpe?g)$/i.test(url.pathname);
    if (isImg) { const hit = await cache.match(req); if (hit) return hit; }
    try { const fresh = await fetch(req); if (fresh.ok) cache.put(req, fresh.clone()); return fresh; }
    catch (_) { return (await cache.match(req)) || (await cache.match('./index.html')) || new Response('Offline', { status: 503 }); }
  })());
});
