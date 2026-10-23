const CACHE = 'phishlens-v1';
const ASSETS = [
  './', './index.html', './manifest.json', './css/style.css',
  './js/main.js', './js/scoring.js', './js/pwa.js',
  './js/analyzers/url.js', './js/analyzers/text.js', './js/analyzers/headers.js',
  './data/brands.js', './data/suspicious-tlds.js', './data/shorteners.js', './data/keywords.js',
  './icons/icon.svg', './tests/test.html', './tests/run.js'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
  }).catch(() => caches.match('./index.html'))));
});
