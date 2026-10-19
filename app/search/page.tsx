// Recherche de films par titre, avec filtre par genre (F08)
// Exemple d'URL : /search?q=inter&genre=Science-fiction

import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { getGenres, getMovies } from "@/lib/movies";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string }>;
}) {
  const { q, genre } = await searchParams;
  const query = q ?? "";
  const selectedGenre = genre ?? "";

  const genres = await getGenres();
  const movies = await getMovies(query, selectedGenre);
  const hasSearch = query.trim() !== "" || selectedGenre !== "";

  return (
    <>
      <h1>Recherche</h1>
      <SearchBar genres={genres} defaultQuery={query} defaultGenre={selectedGenre} />

      {hasSearch && (
        <p className="muted">
          {movies.length} résultat{movies.length > 1 ? "s" : ""}
          {query && <> pour « {query} »</>}
          {selectedGenre && <> dans le genre {selectedGenre}</>}
        </p>
      )}

      {movies.length === 0 ? (
        <div className="empty-state">
          <p>Aucun film ne correspond à votre recherche.</p>
          <p>Essayez un autre titre ou un autre genre.</p>
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
