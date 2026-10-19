// POST /api/library : ajouter un film à sa bibliothèque personnelle (Create)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { LIBRARY_STATUSES } from "@/lib/library";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const movieId = Number(body?.movieId);
  const status = String(body?.status ?? "TO_WATCH");
  const personalNote = String(body?.personalNote ?? "").trim();

  if (!LIBRARY_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }
  if (personalNote.length > 500) {
    return NextResponse.json({ error: "La note personnelle ne doit pas dépasser 500 caractères." }, { status: 400 });
  }

  const movie = Number.isInteger(movieId) ? await prisma.movie.findUnique({ where: { id: movieId } }) : null;
  if (!movie) {
    return NextResponse.json({ error: "Film introuvable." }, { status: 404 });
  }

  const existingEntry = await prisma.personalLibrary.findUnique({
    where: { userId_movieId: { userId: user.id, movieId: movieId } },
  });
  if (existingEntry) {
    return NextResponse.json({ error: "Ce film est déjà dans votre bibliothèque." }, { status: 409 });
  }

  const entry = await prisma.personalLibrary.create({
    data: {
      userId: user.id,
      movieId: movieId,
      status: status,
      personalNote: personalNote,
    },
  });

  return NextResponse.json({ message: "Film ajouté à votre bibliothèque.", entry: entry }, { status: 201 });
}
