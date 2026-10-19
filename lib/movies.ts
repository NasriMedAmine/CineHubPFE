// Fonctions de lecture des films (côté serveur).
// La note moyenne est toujours calculée à partir des avis enregistrés.

import "server-only";
import { prisma } from "./prisma";

// Calcule la moyenne des notes. Retourne null s'il n'y a aucun avis.
export function calculateAverageRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) {
    return null;
  }

  let total = 0;
  for (const review of reviews) {
    total = total + review.rating;
  }

  // Arrondi à une décimale (ex : 4.3)
  return Math.round((total / reviews.length) * 10) / 10;
}

// Liste des films avec leur note moyenne et leur nombre d'avis.
// Les filtres "title" et "genre" sont optionnels (utilisés par la recherche).
export async function getMovies(title?: string, genre?: string) {
  const movies = await prisma.movie.findMany({
    include: {
      reviews: { select: { rating: true } },
    },
    orderBy: { title: "asc" },
  });

  // Filtrage simple, insensible à la casse.
  // (SQLite + Prisma ne propose pas "mode: insensitive", et le catalogue est petit.)
  const searchText = (title ?? "").trim().toLowerCase();
  const filteredMovies = movies.filter((movie) => {
    const matchesTitle = movie.title.toLowerCase().includes(searchText);
    const matchesGenre = !genre || movie.genre === genre;
    return matchesTitle && matchesGenre;
  });

  return filteredMovies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    poster: movie.poster,
    genre: movie.genre,
    releaseYear: movie.releaseYear,
    director: movie.director,
    duration: movie.duration,
    description: movie.description,
    averageRating: calculateAverageRating(movie.reviews),
    reviewCount: movie.reviews.length,
  }));
}

// Liste des genres présents dans le catalogue (pour le filtre).
export async function getGenres() {
  const movies = await prisma.movie.findMany({
    select: { genre: true },
    distinct: ["genre"],
    orderBy: { genre: "asc" },
  });

  return movies.map((movie) => movie.genre);
}

// Type d'un film tel qu'il est affiché dans une carte
export type MovieSummary = Awaited<ReturnType<typeof getMovies>>[number];
