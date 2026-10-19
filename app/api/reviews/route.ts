// POST /api/reviews : publier un avis sur un film

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const movieId = Number(body?.movieId);
  const rating = Number(body?.rating);
  const comment = String(body?.comment ?? "").trim();

  // La note doit être un entier entre 1 et 5
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "La note doit être comprise entre 1 et 5." }, { status: 400 });
  }
  if (comment.length < 3 || comment.length > 1000) {
    return NextResponse.json(
      { error: "Le commentaire doit contenir entre 3 et 1000 caractères." },
      { status: 400 }
    );
  }

  const movie = Number.isInteger(movieId) ? await prisma.movie.findUnique({ where: { id: movieId } }) : null;
  if (!movie) {
    return NextResponse.json({ error: "Film introuvable." }, { status: 404 });
  }

  // Un seul avis par utilisateur et par film
  const existingReview = await prisma.review.findUnique({
    where: { userId_movieId: { userId: user.id, movieId: movieId } },
  });
  if (existingReview) {
    return NextResponse.json(
      { error: "Vous avez déjà publié un avis sur ce film. Vous pouvez le modifier." },
      { status: 409 }
    );
  }

  const review = await prisma.review.create({
    data: { userId: user.id, movieId: movieId, rating: rating, comment: comment },
  });

  return NextResponse.json({ message: "Avis publié.", review: review }, { status: 201 });
}
