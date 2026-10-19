// Mes films favoris — réservé aux utilisateurs connectés

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAverageRating } from "@/lib/movies";
import MovieCard from "@/components/MovieCard";
import RemoveFavoriteButton from "./RemoveFavoriteButton";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/favorites");
  }

  // Seuls les favoris de l'utilisateur connecté sont lus
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      movie: { include: { reviews: { select: { rating: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="section-title">
        <h1>❤️ Mes favoris</h1>
        <span className="muted">{favorites.length} film{favorites.length > 1 ? "s" : ""}</span>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>Vous n&apos;avez encore aucun film favori.</p>
          <Link href="/movies" className="button">
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <div className="movie-grid">
          {favorites.map((favorite) => (
            <div key={favorite.id}>
              <MovieCard
                movie={{
                  ...favorite.movie,
                  averageRating: calculateAverageRating(favorite.movie.reviews),
                }}
              />
              <RemoveFavoriteButton movieId={favorite.movieId} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
