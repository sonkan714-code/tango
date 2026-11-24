// オフラインでも使えるようにするためのキャッシュ。
// ページと単語データは「ネット優先」（更新がすぐ届く）、画像と音声は「キャッシュ優先」。
const CACHE = 'tango-v5';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html', 'words.js', 'daily.js', 'manifest.json', 'icon.svg']))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || req.headers.has('range') || new URL(req.url).origin !== location.origin) return;
  const media = /\/(img|audio)\//.test(req.url);
  const save = res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  e.respondWith(media
    ? caches.match(req).then(hit => hit || fetch(req).then(save))
    : fetch(req).then(save).catch(() => caches.match(req).then(hit => hit || caches.match('index.html'))));
});
