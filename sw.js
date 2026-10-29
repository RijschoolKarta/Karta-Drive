/* Karta Drive: laatste versie bij elke start, en werkt ook zonder internet */
var CACHE = 'karta-drive-v2';
var CORE = ['./', 'index.html', 'firebase-config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE.map(function (u) { return new Request(u, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE && k !== 'fonts' && k !== 'libs'; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Eerst het internet (altijd gecontroleerd op een nieuwe versie). Is het traag of offline, dan de bewaarde versie. */
function latest(req) {
  return caches.open(CACHE).then(function (c) {
    return new Promise(function (resolve) {
      var done = false;
      function fallback() {
        c.match(req, { ignoreSearch: true }).then(function (hit) { if (hit && !done) { done = true; resolve(hit); } });
      }
      var timer = setTimeout(fallback, 2500);
      fetch(req.url, { cache: 'no-cache' }).then(function (res) {
        clearTimeout(timer);
        if (res && res.ok) c.put(req, res.clone());
        if (!done) { done = true; resolve(res); }
      }).catch(function () {
        clearTimeout(timer);
        c.match(req, { ignoreSearch: true }).then(function (hit) { if (!done) { done = true; resolve(hit || Response.error()); } });
      });
    });
  });
}
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(latest(req));
  } else if (url.hostname === 'www.gstatic.com' && url.pathname.indexOf('/firebasejs/') === 0) {
    /* De inlogcode van Firebase heeft een vast versienummer: één keer ophalen, daarna ook zonder internet */
    e.respondWith(caches.open('libs').then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) { if (res && res.ok) c.put(req, res.clone()); return res; });
      });
    }));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open('fonts').then(function (c) {
      return c.match(req).then(function (hit) {
        var net = fetch(req).then(function (res) { c.put(req, res.clone()); return res; }).catch(function () { return hit; });
        return hit || net;
      });
    }));
  }
});
