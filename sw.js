// Beybey : mode hors ligne. Le site s'ouvre sans internet après une première visite.
// Réseau d'abord (tu as toujours la dernière version), cache en secours.
const CACHE = 'beybey-v13';
// Cœur de l'appli : doit être complet, sinon la mise à jour est refusée et l'ancienne version reste active (pas d'appli à moitié à jour).
const CORE = ['./', 'index.html', 'style.css', 'boot.js', 'js/langue.js', 'js/fond.js', 'js/donnees.js', 'js/interface.js', 'js/collection.js', 'js/profil.js', 'js/partage.js', 'js/match.js', 'js/historique.js', 'js/accueil.js', 'data.js', 'catalogue.js', 'catalogue-ajouts.js', 'ph.js','stats.js', 'lib/qrcode.js', 'lib/jsQR.js', 'manifest.json'];
// Le reste est mis en cache au mieux : s'il manque, l'appli marche quand même (réseau d'abord).
const EXTRA = ['CREDITS.txt', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'fonts/inter-latin-400-normal.woff2', 'fonts/inter-latin-500-normal.woff2', 'fonts/inter-latin-600-normal.woff2', 'fonts/chakra-petch-latin-400-normal.woff2', 'fonts/chakra-petch-latin-500-normal.woff2', 'fonts/chakra-petch-latin-600-normal.woff2', 'fonts/chakra-petch-latin-700-normal.woff2',
  'sons/cd.mp3', 'sons/cd_en.mp3', 'sons/next.mp3', 'sons/nul.mp3', 'sons/p1.mp3', 'sons/p2.mp3', 'sons/sc.mp3'].concat(Array.from({length:16},(_,i)=>'avatars/a'+String(i+1).padStart(2,'0')+'.webp'));
const fresh = u => new Request(u, { cache: 'reload' });

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE.map(fresh));
    await Promise.all(EXTRA.map(u => c.add(fresh(u)).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('beybey-') && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
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
      // Pages, scripts et données : on revalide toujours (sinon GitHub Pages sert l'ancienne version jusqu'à 10 min). Photos, sons, polices : cache normal.
      const gros = /\/(photos|sons|fonts|avatars)\//.test(req.url);
      const res = await fetch(req, isRange || gros ? undefined : { cache: 'no-cache' });
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
