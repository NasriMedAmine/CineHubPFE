// Catalogue de films (F06)

import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { getGenres, getMovies } from "@/lib/movies";

export default async function MoviesPage() {
  const movies = await getMovies();
  const genres = await getGenres();

  return (
    <>
      <div className="section-title">
        <h1>Catalogue</h1>
        <span className="muted">{movies.length} films</span>
      </div>

      <SearchBar genres={genres} />

      {movies.length === 0 ? (
        <div className="empty-state">
          <p>Le catalogue est vide pour le moment.</p>
          <p>Lancez <code>npx prisma db seed</code> pour ajouter les films de démonstration.</p>
        </div>
      ) : (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </>
  );
}
