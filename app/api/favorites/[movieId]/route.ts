// DELETE /api/favorites/[movieId] : retirer un film des favoris

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(request: Request, { params }: { params: Promise<{ movieId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const { movieId } = await params;
  if (!Number.isInteger(Number(movieId))) {
    return NextResponse.json({ error: "Film introuvable." }, { status: 404 });
  }

  // On ne supprime que le favori de l'utilisateur connecté
  await prisma.favorite.deleteMany({
    where: { userId: user.id, movieId: Number(movieId) },
  });

  return NextResponse.json({ message: "Film retiré des favoris." });
}
