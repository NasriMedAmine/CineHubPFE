// PUT    /api/library/[id] : modifier une entrée de sa bibliothèque (Update)
// DELETE /api/library/[id] : supprimer une entrée de sa bibliothèque (Delete)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { LIBRARY_STATUSES } from "@/lib/library";

// Retrouve une entrée SEULEMENT si elle appartient à l'utilisateur.
// Un utilisateur ne peut donc jamais modifier l'entrée d'un autre.
async function findUserEntry(entryId: number, userId: number) {
  if (!Number.isInteger(entryId)) {
    return null;
  }
  return prisma.personalLibrary.findFirst({
    where: { id: entryId, userId: userId },
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const { id } = await params;
  const entry = await findUserEntry(Number(id), user.id);
  if (!entry) {
    return NextResponse.json({ error: "Entrée introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const status = String(body?.status ?? "");
  const personalNote = String(body?.personalNote ?? "").trim();

  if (!LIBRARY_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }
  if (personalNote.length > 500) {
    return NextResponse.json({ error: "La note personnelle ne doit pas dépasser 500 caractères." }, { status: 400 });
  }

  const updatedEntry = await prisma.personalLibrary.update({
    where: { id: entry.id },
    data: { status: status, personalNote: personalNote },
  });

  return NextResponse.json({ message: "Entrée modifiée.", entry: updatedEntry });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const { id } = await params;
  const entry = await findUserEntry(Number(id), user.id);
  if (!entry) {
    return NextResponse.json({ error: "Entrée introuvable." }, { status: 404 });
  }

  await prisma.personalLibrary.delete({ where: { id: entry.id } });

  return NextResponse.json({ message: "Film retiré de votre bibliothèque." });
}
