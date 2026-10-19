// Page d'accueil

import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import { getMovies } from "@/lib/movies";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  const movies = await getMovies();

  // Les 5 films les mieux notés (les films sans avis passent à la fin)
  const topMovies = [...movies]
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .slice(0, 5);

  return (
    <>
      <section className="hero">
        <h1>
          Bienvenue sur Cine<span style={{ color: "var(--accent)" }}>Hub</span>
        </h1>
        <p>
          Découvrez des films, partagez vos avis, gérez votre bibliothèque personnelle et
          laissez notre assistant IA vous proposer le film parfait pour ce soir.
        </p>
        <div className="hero-buttons">
          <Link href="/movies" className="button">
            🎬 Parcourir le catalogue
          </Link>
          {user ? (
            <Link href="/assistant" className="button button-secondary">
              🤖 Demander à l&apos;assistant
            </Link>
          ) : (
            <Link href="/register" className="button button-secondary">
              Créer un compte
            </Link>
          )}
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>⭐ Avis et notes</h3>
          <p>Notez les films de 1 à 5 et lisez les avis des autres membres.</p>
        </div>
        <div className="feature">
          <h3>📚 Bibliothèque</h3>
          <p>Gardez la liste des films à voir, en cours ou déjà vus, avec vos notes.</p>
        </div>
        <div className="feature">
          <h3>📱 Application installable</h3>
          <p>Installez CineHub sur votre appareil et consultez les pages visitées hors ligne.</p>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Films à la une</h2>
          <Link href="/movies" className="muted">
            Voir tout →
          </Link>
        </div>
        <div className="movie-grid">
          {topMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </>
  );
}
