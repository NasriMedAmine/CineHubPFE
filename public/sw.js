// Service worker de CineHub
// Il s'exécute en arrière-plan dans le navigateur et intercepte les requêtes
// pour permettre une consultation hors ligne des pages déjà visitées.
//
// Stratégies utilisées :
// - Pages publiques (accueil, catalogue, fiches, recherche) : "réseau d'abord".
//   On essaie le serveur ; si ça marche on garde une copie, sinon on sert la copie.
// - Fichiers statiques (JS, CSS, images, icônes) : "cache d'abord".
// - API, connexion, pages privées et requêtes POST/PUT/DELETE : jamais mises en cache.

const STATIC_CACHE = "cinehub-static-v1";
const PAGES_CACHE = "cinehub-pages";

// Fichiers enregistrés dès l'installation
const PRECACHE_URLS = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Pages publiques que l'on accepte de garder en cache
function isPublicPage(pathname) {
  return (
    pathname === "/" ||
    pathname === "/movies" ||
    pathname.startsWith("/movies/") ||
    pathname === "/search"
  );
}

// Fichiers statiques
function isStaticFile(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/")
  );
}

// 1. Installation : on met en cache la page hors ligne et les icônes
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // la nouvelle version s'active tout de suite
});

// 2. Activation : on supprime les anciennes versions du cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== PAGES_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// 3. Interception des requêtes
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // On ne s'occupe que des lectures (GET) sur notre propre site
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Les routes API (connexion, avis, IA...) passent toujours par le réseau
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Navigation vers une page
  if (request.mode === "navigate") {
    if (isPublicPage(url.pathname)) {
      event.respondWith(networkFirst(request));
    } else {
      // Pages privées (profil, favoris...) : pas de cache, page hors ligne si échec
      event.respondWith(fetch(request).catch(() => caches.match("/offline")));
    }
    return;
  }

  // Fichiers statiques
  if (isStaticFile(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

// Réseau d'abord, copie de secours en cache
async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cachedResponse = await cache.match(request);
    return cachedResponse || caches.match("/offline");
  }
}

// Cache d'abord, réseau si le fichier n'est pas encore en cache
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503, statusText: "Hors ligne" });
  }
}
