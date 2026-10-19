// POST /api/favorites : ajouter un film aux favoris

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

  const movie = Number.isInteger(movieId) ? await prisma.movie.findUnique({ where: { id: movieId } }) : null;
  if (!movie) {
    return NextResponse.json({ error: "Film introuvable." }, { status: 404 });
  }

  // upsert : crée le favori s'il n'existe pas encore (évite les doublons)
  await prisma.favorite.upsert({
    where: { userId_movieId: { userId: user.id, movieId: movieId } },
    update: {},
    create: { userId: user.id, movieId: movieId },
  });

  return NextResponse.json({ message: "Film ajouté aux favoris." }, { status: 201 });
}
