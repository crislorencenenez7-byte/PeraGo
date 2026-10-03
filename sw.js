const CACHE_NAME = "perago-v11";

const APP_FILES = [
  "./",
  "./index.html",
  "./register.html",
  "./pin-lock.html",
  "./forgot-pin.html",
  "./reset-pin.html",
  "./set-pin.html",
  "./send-money.html",
  "./cash-in.html",
  "./qr.html",
  "./profile.html",
  "./change-pin.html",
  "./styles.css",
  "./script.js",
  "./auth.css",
  "./firebase-config.js",
  "./firebase-auth.js",
  "./session.js",
  "./pin.js",
  "./wallet.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error("PeraGo SW install failed:", error);
        throw error;
      })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
