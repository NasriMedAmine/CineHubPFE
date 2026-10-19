"use client";

// Une entrée de la bibliothèque : affichage + modification (Update) + suppression (Delete)

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUS_LABELS } from "@/lib/library";

type LibraryItemProps = {
  entry: {
    id: number;
    status: string;
    personalNote: string;
    updatedAt: string;
    movie: { id: number; title: string; poster: string; genre: string; releaseYear: number };
  };
};

export default function LibraryItem({ entry }: LibraryItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(entry.status);
  const [personalNote, setPersonalNote] = useState(entry.personalNote);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await fetch(`/api/library/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, personalNote }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error);
      } else {
        setIsEditing(false);
        router.refresh();
      }
    } catch {
      setErrorMessage("Action impossible : vous semblez être hors ligne.");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`Retirer « ${entry.movie.title} » de votre bibliothèque ?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/library/${entry.id}`, { method: "DELETE" });
      if (response.ok) {
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
    <article className="library-item">
      <Link href={`/movies/${entry.movie.id}`}>
        <img src={entry.movie.poster} alt={`Affiche de ${entry.movie.title}`} />
      </Link>

      <div>
        <h3>
          <Link href={`/movies/${entry.movie.id}`}>{entry.movie.title}</Link>
        </h3>
        <p className="muted" style={{ margin: "0 0 6px", fontSize: "0.85rem" }}>
          {entry.movie.genre} · {entry.movie.releaseYear} · modifié le {entry.updatedAt}
        </p>

        {isEditing ? (
          <form className="form" onSubmit={handleSave}>
            <label>
              Statut
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {Object.keys(STATUS_LABELS).map((key) => (
                  <option key={key} value={key}>
                    {STATUS_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Note personnelle
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                maxLength={500}
                placeholder="Ex : à regarder avec des amis, conseillé par Paul..."
              />
            </label>
            <div className="actions" style={{ margin: 0 }}>
              <button type="submit" className="button button-small" disabled={loading}>
                Enregistrer
              </button>
              <button type="button" className="button button-secondary button-small" onClick={() => setIsEditing(false)}>
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <>
            <span className="status-badge">{STATUS_LABELS[entry.status]}</span>
            {entry.personalNote && <p style={{ margin: "8px 0 0" }}>📝 {entry.personalNote}</p>}
            <div className="actions" style={{ marginBottom: 0 }}>
              <button className="button button-secondary button-small" onClick={() => setIsEditing(true)}>
                ✏️ Modifier
              </button>
              <button className="button button-danger button-small" onClick={handleDelete} disabled={loading}>
                🗑️ Supprimer
              </button>
            </div>
          </>
        )}

        {errorMessage && <p className="message-error">{errorMessage}</p>}
      </div>
    </article>
  );
}
