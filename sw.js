const CACHE_NAME = "app-cache-v1";
const OFFLINE_URL = "/offline-page.html";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "/",
        OFFLINE_URL
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      if (event.request.mode === "navigate") {
        return caches.match(OFFLINE_URL);
      }
      return new Response("", { status: 404 });
    })
  );
});