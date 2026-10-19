// PUT /api/profile : modification du profil de l'utilisateur connecté (F04)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isValidEmail } from "@/lib/auth";

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!name || name.length > 50) {
    return NextResponse.json({ error: "Le nom est obligatoire (50 caractères maximum)." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "L'adresse email n'est pas valide." }, { status: 400 });
  }

  // Si l'email change, il ne doit pas être déjà utilisé par un autre compte
  if (email !== user.email) {
    const otherUser = await prisma.user.findUnique({ where: { email: email } });
    if (otherUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }
  }

  // On met à jour uniquement l'utilisateur connecté (son id vient de la session)
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: name, email: email },
    select: { name: true, email: true },
  });

  return NextResponse.json({ message: "Profil mis à jour.", user: updatedUser });
}
