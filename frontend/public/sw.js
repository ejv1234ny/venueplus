/* VenuePlus service worker.
 *
 * Deliberately minimal + safe: it exists mainly to make the app installable
 * (Chrome/Android require a service worker with a fetch handler) and to show a
 * friendly offline page. It ONLY intercepts same-origin GET *navigations* —
 * API/data requests (POST, cross-origin, the Railway backend) pass straight
 * through and are never cached, so nothing goes stale or breaks.
 */
const CACHE = 'venueplus-shell-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icon-192.png', '/venueplus-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle top-level page navigations; leave everything else (API calls,
  // assets, cross-origin) to the browser's default handling.
  if (req.method === 'GET' && req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
  }
});
