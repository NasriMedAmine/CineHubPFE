"use client";

// Enregistre le service worker (public/sw.js) au chargement de l'application.
// En développement, on ne l'active pas pour éviter de garder d'anciennes pages en cache.

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return; // navigateur trop ancien
    }

    if (process.env.NODE_ENV !== "production") {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Échec de l'enregistrement du service worker :", error);
    });
  }, []);

  return null;
}
