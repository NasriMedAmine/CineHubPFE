// PUT    /api/reviews/[id] : modifier son avis
// DELETE /api/reviews/[id] : supprimer son avis

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// On cherche l'avis avec son id ET l'id de l'utilisateur :
// impossible de modifier ou supprimer l'avis de quelqu'un d'autre.
async function findUserReview(reviewId: number, userId: number) {
  if (!Number.isInteger(reviewId)) {
    return null;
  }
  return prisma.review.findFirst({ where: { id: reviewId, userId: userId } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const { id } = await params;
  const review = await findUserReview(Number(id), user.id);
  if (!review) {
    return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const rating = Number(body?.rating);
  const comment = String(body?.comment ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "La note doit être comprise entre 1 et 5." }, { status: 400 });
  }
  if (comment.length < 3 || comment.length > 1000) {
    return NextResponse.json(
      { error: "Le commentaire doit contenir entre 3 et 1000 caractères." },
      { status: 400 }
    );
  }

  const updatedReview = await prisma.review.update({
    where: { id: review.id },
    data: { rating: rating, comment: comment },
  });

  return NextResponse.json({ message: "Avis modifié.", review: updatedReview });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const { id } = await params;
  const review = await findUserReview(Number(id), user.id);
  if (!review) {
    return NextResponse.json({ error: "Avis introuvable." }, { status: 404 });
  }

  await prisma.review.delete({ where: { id: review.id } });

  return NextResponse.json({ message: "Avis supprimé." });
}
