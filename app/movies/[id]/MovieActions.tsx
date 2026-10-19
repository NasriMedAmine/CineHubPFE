"use client";

// Boutons "Favoris" et "Bibliothèque" de la page de détail d'un film

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUS_LABELS } from "@/lib/library";

type MovieActionsProps = {
  movieId: number;
  initialIsFavorite: boolean;
  initialInLibrary: boolean;
};

export default function MovieActions({ movieId, initialIsFavorite, initialInLibrary }: MovieActionsProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [inLibrary, setInLibrary] = useState(initialInLibrary);
  const [status, setStatus] = useState("TO_WATCH");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    setErrorMessage("");
    setLoading(true);
    try {
      // Si le film est déjà en favori on le retire, sinon on l'ajoute
      const response = isFavorite
        ? await fetch(`/api/favorites/${movieId}`, { method: "DELETE" })
        : await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId }),
          });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        const data = await response.json();
        setErrorMessage(data.error);
      }
    } catch {
      setErrorMessage("Action impossible : vous semblez être hors ligne.");
    }
    setLoading(false);
  }

  async function addToLibrary() {
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, status }),
      });

      if (response.ok) {
        setInLibrary(true);
        router.refresh();
      } else {
        const data = await response.json();
        setErrorMessage(data.error);
      }
    } catch {
      setErrorMessage("Action impossible : vous semblez être hors ligne.");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="actions">
        <button className="button button-secondary" onClick={toggleFavorite} disabled={loading}>
          {isFavorite ? "💔 Retirer des favoris" : "❤️ Ajouter aux favoris"}
        </button>

        {inLibrary ? (
          <Link href="/library" className="button button-secondary">
            📚 Dans ma bibliothèque
          </Link>
        ) : (
          <>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Statut">
              {Object.keys(STATUS_LABELS).map((key) => (
                <option key={key} value={key}>
                  {STATUS_LABELS[key]}
                </option>
              ))}
            </select>
            <button className="button" onClick={addToLibrary} disabled={loading}>
              📚 Ajouter à ma bibliothèque
            </button>
          </>
        )}
      </div>
      {errorMessage && <p className="message-error">{errorMessage}</p>}
    </div>
  );
}
