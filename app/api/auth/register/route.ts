// POST /api/auth/register : création d'un compte (F01)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isValidEmail } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const confirmPassword = String(body?.confirmPassword ?? "");

  // 1. Vérification des champs
  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
  }
  if (name.length > 50) {
    return NextResponse.json({ error: "Le nom ne doit pas dépasser 50 caractères." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "L'adresse email n'est pas valide." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 100) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir entre 8 et 100 caractères." },
      { status: 400 }
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Les deux mots de passe ne correspondent pas." }, { status: 400 });
  }

  // 2. L'email doit être unique
  const existingUser = await prisma.user.findUnique({ where: { email: email } });
  if (existingUser) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  // 3. Enregistrement avec le mot de passe haché
  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name: name, email: email, passwordHash: passwordHash },
  });

  return NextResponse.json({ message: "Compte créé avec succès." }, { status: 201 });
}
