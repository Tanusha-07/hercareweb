/*
 * HerCare+ service worker — offline-first for a low-connectivity SPA.
 *
 * Strategy (kept simple and honest):
 *  - Precache the app shell (/, /index.html, manifest, icons).
 *  - Navigations: network-first with a cached index.html fallback, so the app
 *    still opens offline. This is an SPA, so index.html bootstraps every route.
 *  - Same-origin static assets (/assets, js/css/svg/png/woff): serve from cache
 *    when present, else fetch and fill the cache (stale-while-revalidate).
 *  - Everything else (e.g. future API calls): network-first, cache fallback.
 *
 * Personal health records are NOT cached by this worker — they live in
 * localStorage per user. This worker only makes the *app* available offline.
 */

const VERSION = 'v1';
const SHELL_CACHE = `hercare-shell-${VERSION}`;
const ASSET_CACHE = `hercare-assets-${VERSION}`;

const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest', '/logo.png'];

const ASSET_EXT = /\.(?:js|css|svg|png|jpg|jpeg|webp|woff2?|ttf|ico)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    return cached || (await cache.match('/index.html')) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((fresh) => {
      cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // don't touch cross-origin

  // Never cache private API responses (OTP, AI, health records).
  if (url.pathname.startsWith('/api/')) return;

  // App navigations -> network-first, fall back to cached shell (offline open).
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static build assets & icons -> cache-first, refresh in background.
  if (url.pathname.startsWith('/assets/') || ASSET_EXT.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});
