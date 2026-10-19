// Page affichée par le service worker quand une page n'est pas disponible hors ligne.
// Elle est mise en cache dès l'installation du service worker.

import Link from "next/link";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="empty-state" style={{ maxWidth: 560, margin: "40px auto" }}>
      <h1>📡 Vous êtes hors ligne</h1>
      <p>
        Cette page n&apos;a pas encore été consultée avec une connexion internet, elle n&apos;est donc pas
        disponible hors ligne.
      </p>
      <p>Les pages publiques que vous avez déjà visitées (catalogue, fiches de films) restent accessibles.</p>
      <Link href="/" className="button">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
