// Détail d'un film (F07) : informations, note moyenne, avis et actions

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateAverageRating } from "@/lib/movies";
import RatingStars from "@/components/RatingStars";
import ReviewCard from "@/components/ReviewCard";
import MovieActions from "./MovieActions";
import ReviewSection from "./ReviewSection";

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movieId = Number(id);

  if (!Number.isInteger(movieId)) {
    notFound();
  }

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!movie) {
    notFound();
  }

  const user = await getCurrentUser();
  const averageRating = calculateAverageRating(movie.reviews);

  // Informations propres à l'utilisateur connecté
  let isFavorite = false;
  let libraryEntry = null;
  let myReview = null;

  if (user) {
    const favorite = await prisma.favorite.findUnique({
      where: { userId_movieId: { userId: user.id, movieId: movie.id } },
    });
    isFavorite = favorite !== null;

    libraryEntry = await prisma.personalLibrary.findUnique({
      where: { userId_movieId: { userId: user.id, movieId: movie.id } },
    });

    myReview = movie.reviews.find((review) => review.userId === user.id) ?? null;
  }

  // Les avis des autres utilisateurs (le sien est affiché à part)
  const otherReviews = movie.reviews.filter((review) => !user || review.userId !== user.id);

  return (
    <>
      <p>
        <Link href="/movies" className="muted">
          ← Retour au catalogue
        </Link>
      </p>

      <div className="movie-detail">
        <img src={movie.poster} alt={`Affiche de ${movie.title}`} />

        <div>
          <h1>{movie.title}</h1>
          <div className="tags">
            <span className="tag tag-accent">{movie.genre}</span>
            <span className="tag">{movie.releaseYear}</span>
            <span className="tag">{movie.duration} min</span>
          </div>
          <RatingStars rating={averageRating} reviewCount={movie.reviews.length} />
          <p>{movie.description}</p>
          <p className="muted">
            Réalisé par <strong>{movie.director}</strong>
          </p>

          {user ? (
            <MovieActions
              movieId={movie.id}
              initialIsFavorite={isFavorite}
              initialInLibrary={libraryEntry !== null}
            />
          ) : (
            <p className="message-info">
              <Link href={`/login?next=/movies/${movie.id}`}>Connectez-vous</Link> pour ajouter ce film à vos
              favoris, à votre bibliothèque ou publier un avis.
            </p>
          )}
        </div>
      </div>

      <section className="panel">
        <h2>Avis ({movie.reviews.length})</h2>

        {user && (
          <ReviewSection
            movieId={movie.id}
            myReview={
              myReview
                ? { id: myReview.id, rating: myReview.rating, comment: myReview.comment }
                : null
            }
          />
        )}

        <div className="review-list">
          {otherReviews.length === 0 && !myReview && (
            <p className="muted">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
          )}
          {otherReviews.map((review) => (
            <ReviewCard
              key={review.id}
              authorName={review.user.name}
              rating={review.rating}
              comment={review.comment}
              date={review.createdAt.toLocaleDateString("fr-FR")}
            />
          ))}
        </div>
      </section>
    </>
  );
}
