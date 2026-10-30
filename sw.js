// Beybey : mode hors ligne. Le site s'ouvre sans internet après une première visite.
// Réseau d'abord (tu as toujours la dernière version), cache en secours.
const CACHE = 'beybey-v1';
const BASE = ['./', 'index.html', 'data.js', 'catalogue.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'sons/cd.mp3', 'sons/cd_en.mp3', 'sons/next.mp3', 'sons/nul.mp3', 'sons/p1.mp3', 'sons/p2.mp3', 'sons/sc.mp3'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(BASE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});

async function ranged(req, res) {
  // Les sons demandent des morceaux (Range) : on les redécoupe depuis le fichier en cache.
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  const buf = await res.arrayBuffer(), n = buf.byteLength;
  let s = m && m[1] ? +m[1] : 0, f = m && m[2] ? +m[2] : n - 1;
  if (s > f || s >= n) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + n } });
  f = Math.min(f, n - 1);
  return new Response(buf.slice(s, f + 1), { status: 206, headers: { 'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg', 'Content-Range': `bytes ${s}-${f}/${n}`, 'Content-Length': String(f - s + 1), 'Accept-Ranges': 'bytes' } });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isRange = req.headers.has('range');
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res.status === 200 && !isRange) cache.put(req, res.clone()).catch(() => {});
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true, ignoreVary: true }) || (isRange ? await cache.match(req.url) : null)
        || (req.mode === 'navigate' ? await cache.match('index.html') : null);
      if (!hit) return Response.error();
      return isRange && hit.status === 200 ? ranged(req, hit) : hit;
    }
  })());
});
