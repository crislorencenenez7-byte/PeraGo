const CACHE_NAME = "perago-v202610071900";

const APP_FILES = [
  "./",
  "./index.html",
  "./register.html",
  "./pin-lock.html",
  "./forgot-pin.html",
  "./reset-pin.html",
  "./set-pin.html",
  "./send-money.html",
  "./qr.html",
  "./profile.html",
  "./change-pin.html",
  "./styles.css",
  "./auth.css",
  "./script.js",
  "./auth.js",
  "./firebase-config.js",
  "./firebase-auth.js",
  "./session.js",
  "./pin.js",
  "./wallet.js",
  "./wallet-firestore.js",
  "./logout.js",
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
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith("perago-") && key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isDocument = event.request.mode === "navigate";
  const isCode = ["script", "style"].includes(event.request.destination);

  if (isDocument || isCode) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached ||
      fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
    )
  );
});
