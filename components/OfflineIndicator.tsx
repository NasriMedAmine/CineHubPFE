"use client";

// Bandeau affiché quand l'appareil n'a plus de connexion internet.

import { useEffect, useState } from "react";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function updateStatus() {
      setIsOffline(!navigator.onLine);
    }

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="offline-banner" role="status">
      📡 Vous êtes hors ligne. Les pages déjà visitées restent consultables, mais les
      modifications et l&apos;assistant IA sont indisponibles.
    </div>
  );
}
