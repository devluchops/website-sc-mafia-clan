/* Clan MAFIA — Service Worker (PWA + Web Push) */
const SW_VERSION = "v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* ----------------------------------------------------------------------------
 * Badge del ícono (el numerito rojo): la Badging API.
 *
 * Cada push suma 1 a un contador (guardado en IndexedDB para que sobreviva aunque
 * el SW se duerma) y lo pinta en el ícono con setAppBadge. Al abrir la app, el
 * cliente manda "clear-badge" y el número desaparece. Si el push trae badgeCount,
 * se usa ese número exacto en vez de sumar.
 *
 * Funciona en iPhone (iOS 16.4+, con notificaciones aceptadas), Android y escritorio.
 * -------------------------------------------------------------------------- */
const BADGE_DB = "mafia-badge";
const BADGE_STORE = "kv";
const BADGE_KEY = "count";

function openBadgeDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BADGE_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(BADGE_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readBadgeCount() {
  try {
    const db = await openBadgeDb();
    return await new Promise((resolve) => {
      const req = db.transaction(BADGE_STORE, "readonly").objectStore(BADGE_STORE).get(BADGE_KEY);
      req.onsuccess = () => resolve(Number(req.result) || 0);
      req.onerror = () => resolve(0);
    });
  } catch (_e) {
    return 0;
  }
}

async function writeBadgeCount(n) {
  try {
    const db = await openBadgeDb();
    await new Promise((resolve) => {
      const req = db.transaction(BADGE_STORE, "readwrite").objectStore(BADGE_STORE).put(n, BADGE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (_e) {}
}

async function setBadge(n) {
  await writeBadgeCount(n);
  if (self.navigator && "setAppBadge" in self.navigator) {
    try {
      await self.navigator.setAppBadge(n);
    } catch (_e) {}
  }
}

async function clearBadge() {
  await writeBadgeCount(0);
  if (self.navigator && "clearAppBadge" in self.navigator) {
    try {
      await self.navigator.clearAppBadge();
    } catch (_e) {}
  }
}

// Push recibido -> mostrar notificación + subir el badge del ícono
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = { title: "Clan MAFIA", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Clan MAFIA";
  const options = {
    body: data.body || "",
    icon: data.icon || "/logo.png",
    badge: data.badge || "/logo.png",
    image: data.image || undefined,
    tag: data.tag || undefined,
    renotify: !!data.tag,
    data: { url: data.url || "/" },
    vibrate: [80, 40, 80],
  };

  event.waitUntil(
    (async () => {
      const count =
        typeof data.badgeCount === "number" ? data.badgeCount : (await readBadgeCount()) + 1;
      await setBadge(count);
      await self.registration.showNotification(title, options);
    })()
  );
});

// Click en la notificación -> abrir / enfocar la app y limpiar el badge
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      await clearBadge();
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl).catch(() => {});
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })()
  );
});

// La app pide limpiar el badge (al abrirse o volver al frente)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "clear-badge") {
    event.waitUntil(clearBadge());
  }
});

// Handler mínimo para que el navegador considere la app instalable
self.addEventListener("fetch", () => {});
