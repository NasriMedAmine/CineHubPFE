"use client";

// Gestion de l'avis de l'utilisateur connecté sur un film :
// publier (Create), modifier (Update) et supprimer (Delete).

import { useRouter } from "next/navigation";
import { useState } from "react";
import ReviewCard from "@/components/ReviewCard";

type ReviewSectionProps = {
  movieId: number;
  myReview: { id: number; rating: number; comment: string } | null;
};

export default function ReviewSection({ movieId, myReview }: ReviewSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(myReview ? myReview.rating : 0);
  const [comment, setComment] = useState(myReview ? myReview.comment : "");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (rating < 1) {
      setErrorMessage("Choisissez une note entre 1 et 5 étoiles.");
      return;
    }

    setLoading(true);
    try {
      // POST pour un nouvel avis, PUT pour modifier l'avis existant
      const response = myReview
        ? await fetch(`/api/reviews/${myReview.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rating, comment }),
          })
        : await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId, rating, comment }),
          });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error);
      } else {
        setIsEditing(false);
        router.refresh(); // recharge les avis et la note moyenne
      }
    } catch {
      setErrorMessage("Action impossible : vous semblez être hors ligne.");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!myReview || !confirm("Supprimer votre avis ?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${myReview.id}`, { method: "DELETE" });
      if (response.ok) {
        setRating(0);
        setComment("");
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

  // L'utilisateur a déjà un avis et ne le modifie pas : on l'affiche
  if (myReview && !isEditing) {
    return (
      <div style={{ marginBottom: 16 }}>
        <h3>Mon avis</h3>
        <ReviewCard authorName="Vous" rating={myReview.rating} comment={myReview.comment} date="">
          <div className="actions">
            <button className="button button-secondary button-small" onClick={() => setIsEditing(true)}>
              ✏️ Modifier
            </button>
            <button className="button button-danger button-small" onClick={handleDelete} disabled={loading}>
              🗑️ Supprimer
            </button>
          </div>
        </ReviewCard>
        {errorMessage && <p className="message-error">{errorMessage}</p>}
      </div>
    );
  }

  // Sinon : formulaire de création ou de modification
  return (
    <form className="form" onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <h3 style={{ margin: 0 }}>{myReview ? "Modifier mon avis" : "Publier un avis"}</h3>
      {errorMessage && <p className="message-error">{errorMessage}</p>}

      <div className="star-input" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={value <= rating ? "selected" : ""}
            onClick={() => setRating(value)}
            aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Qu'avez-vous pensé de ce film ?"
        required
        minLength={3}
        maxLength={1000}
      />

      <div className="actions" style={{ margin: 0 }}>
        <button type="submit" className="button" disabled={loading}>
          {myReview ? "Enregistrer" : "Publier"}
        </button>
        {myReview && (
          <button type="button" className="button button-secondary" onClick={() => setIsEditing(false)}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
