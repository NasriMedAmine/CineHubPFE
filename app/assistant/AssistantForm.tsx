"use client";

// Formulaire de l'assistant : envoie les préférences au serveur (/api/ai/recommend)
// puis affiche les recommandations reçues.

import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

type Recommendation = {
  movieId: number | null;
  title: string;
  genre: string;
  explanation: string;
};

const EXAMPLES = [
  "J'aime les films de science-fiction.",
  "Recommande-moi une comédie pour ce soir.",
  "Je veux un film d'action sorti après 2015.",
  "Propose un film similaire à Interstellar.",
];

export default function AssistantForm() {
  const [preferences, setPreferences] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [mode, setMode] = useState(""); // "ai" ou "fallback"
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // L'assistant a besoin d'internet : on le désactive hors ligne
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setRecommendations([]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error);
      } else {
        setMode(data.mode);
        setInfoMessage(data.message ?? "");
        setRecommendations(data.recommendations);
      }
    } catch {
      setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
    }
    setLoading(false);
  }

  return (
    <>
      <form className="form panel" onSubmit={handleSubmit}>
        <label>
          Vos envies
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Ex : un film qui fait réfléchir, avec de beaux effets visuels..."
            required
            minLength={3}
            maxLength={500}
          />
        </label>

        <div className="examples">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="button button-secondary button-small"
              onClick={() => setPreferences(example)}
            >
              {example}
            </button>
          ))}
        </div>

        {isOffline && (
          <p className="message-error">L&apos;assistant nécessite une connexion internet. Reconnectez-vous pour l&apos;utiliser.</p>
        )}

        <button type="submit" className="button" disabled={loading || isOffline}>
          {loading ? "Recherche en cours..." : "✨ Obtenir des recommandations"}
        </button>
      </form>

      {loading && <LoadingSpinner />}
      {errorMessage && <p className="message-error" style={{ marginTop: 16 }}>{errorMessage}</p>}
      {infoMessage && <p className="message-info" style={{ marginTop: 16 }}>{infoMessage}</p>}

      {!loading && mode !== "" && recommendations.length === 0 && !errorMessage && (
        <p className="empty-state" style={{ marginTop: 16 }}>Aucun film ne correspond à cette demande.</p>
      )}

      {recommendations.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h2>{mode === "ai" ? "Recommandations de l'IA" : "Résultats du filtrage simple (sans IA)"}</h2>
          <div className="review-list">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation">
                <h3>{recommendation.title}</h3>
                <span className="tag tag-accent">{recommendation.genre}</span>
                <p>{recommendation.explanation}</p>
                {recommendation.movieId !== null ? (
                  <Link href={`/movies/${recommendation.movieId}`} className="button button-small">
                    Voir la fiche du film
                  </Link>
                ) : (
                  <small className="muted">Ce film n&apos;est pas (encore) dans le catalogue CineHub.</small>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
