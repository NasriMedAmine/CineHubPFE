// POST /api/auth/login : connexion (F02)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Veuillez saisir votre email et votre mot de passe." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email } });

  // Même message d'erreur si l'email ou le mot de passe est faux :
  // on ne révèle pas quels emails existent dans la base.
  const passwordIsCorrect = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordIsCorrect) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({ message: "Connexion réussie." });
}
