"use client";

// Bouton pour retirer un film des favoris depuis la page "Mes favoris"

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RemoveFavoriteButton({ movieId }: { movieId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const response = await fetch(`/api/favorites/${movieId}`, { method: "DELETE" });
      if (response.ok) {
        router.refresh(); // recharge la liste
      } else {
        alert("Impossible de retirer ce favori.");
      }
    } catch {
      alert("Action impossible : vous semblez être hors ligne.");
    }
    setLoading(false);
  }

  return (
    <button
      className="button button-danger button-small"
      style={{ width: "100%", marginTop: 6 }}
      onClick={handleClick}
      disabled={loading}
    >
      Retirer des favoris
    </button>
  );
}
