// Page 404

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty-state" style={{ maxWidth: 560, margin: "40px auto" }}>
      <h1>404 — Page introuvable</h1>
      <p>Ce film ou cette page n&apos;existe pas.</p>
      <Link href="/movies" className="button">
        Voir le catalogue
      </Link>
    </div>
  );
}
