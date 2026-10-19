// Barre de recherche : un simple formulaire HTML qui envoie vers /search?q=...&genre=...
// Pas besoin de JavaScript : le navigateur ajoute les champs dans l'URL.

type SearchBarProps = {
  genres: string[];
  defaultQuery?: string;
  defaultGenre?: string;
};

export default function SearchBar({ genres, defaultQuery = "", defaultGenre = "" }: SearchBarProps) {
  return (
    <form action="/search" method="GET" className="search-bar" role="search">
      <input
        type="search"
        name="q"
        placeholder="Rechercher un film par titre..."
        defaultValue={defaultQuery}
        aria-label="Titre du film"
      />
      <select name="genre" defaultValue={defaultGenre} aria-label="Genre">
        <option value="">Tous les genres</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
      <button type="submit" className="button">
        🔍 Rechercher
      </button>
    </form>
  );
}
