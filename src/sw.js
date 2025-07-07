import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const DYNAMIC_CACHE = "dynamic-content-v2";
const MAP_TILES_CACHE = "map-tiles-v1";

self.addEventListener("push", (event) => {
  let title = "Notifikasi Baru";
  let options = {
    body: "Ada aktivitas baru di aplikasi.",
    icon: "/images/logo-144x144.png",
    badge: "/images/logo.png",
    data: { url: "/" }
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      if (payload.title) title = payload.title;
      if (payload.options) options = { ...options, ...payload.options };
    }
  } catch (err) {
    console.log("Push event data is not JSON");
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

registerRoute(
  ({ url }) =>
    url.hostname.includes("tile.openstreetmap.org") ||
    url.hostname.includes("api.mapbox.com") ||
    (url.pathname.endsWith(".png") && url.pathname.includes("/tiles/")),
  new CacheFirst({
    cacheName: MAP_TILES_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30
      })
    ]
  })
);

registerRoute(
  ({ url }) =>
    url.hostname === "story-api.dicoding.dev" ||
    (url.origin === self.location.origin &&
      (url.pathname.startsWith("/api/") || url.pathname.startsWith("/v1/"))),
  new NetworkFirst({
    cacheName: DYNAMIC_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7
      })
    ]
  })
);
