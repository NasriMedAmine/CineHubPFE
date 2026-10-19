"use client";

// Bouton "Installer l'application".
// Il n'apparaît que si le navigateur déclenche l'événement "beforeinstallprompt"
// (Chrome, Edge, Android...). Les autres navigateurs (Safari, Firefox) ne le
// proposent pas : l'installation se fait alors depuis leur propre menu.

import { useEffect, useState } from "react";

// Type minimal de l'événement (il n'existe pas dans les types TypeScript standards)
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export default function InstallButton() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    function handleBeforeInstall(event: Event) {
      event.preventDefault(); // on garde l'événement pour l'utiliser au clic
      setInstallEvent(event as InstallPromptEvent);
    }

    function handleInstalled() {
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (!installEvent) {
    return null;
  }

  async function handleClick() {
    if (installEvent) {
      await installEvent.prompt();
      setInstallEvent(null);
    }
  }

  return (
    <button className="button button-secondary button-small" onClick={handleClick}>
      ⬇ Installer
    </button>
  );
}
