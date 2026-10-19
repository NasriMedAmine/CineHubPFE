// Carte d'un film dans une grille : affiche, titre, genre, année, note et bouton "Détails".

import Link from "next/link";
import RatingStars from "./RatingStars";

type MovieCardProps = {
  movie: {
    id: number;
    title: string;
    poster: string;
    genre: string;
    releaseYear: number;
    averageRating: number | null;
  };
};

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="movie-card">
      <Link href={`/movies/${movie.id}`}>
        <img src={movie.poster} alt={`Affiche de ${movie.title}`} loading="lazy" />
      </Link>
      <div className="movie-card-body">
        <h3 className="movie-card-title">{movie.title}</h3>
        <span className="movie-card-info">
          {movie.genre} · {movie.releaseYear}
        </span>
        <RatingStars rating={movie.averageRating} />
        <Link href={`/movies/${movie.id}`} className="button button-small">
          Détails
        </Link>
      </div>
    </article>
  );
}
