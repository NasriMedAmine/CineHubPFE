// Fonctions d'authentification : mots de passe, sessions et utilisateur connecté.
// Ce fichier n'est utilisé que côté serveur.

import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE_NAME = "cinehub_session";
const SESSION_DURATION_DAYS = 7;

// ---------- Mots de passe ----------

// On ne stocke jamais le mot de passe en clair : bcrypt calcule une empreinte
// avec un "sel" aléatoire. 10 = nombre de tours (coût du calcul).
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

// ---------- Sessions ----------

// Empreinte SHA-256 du jeton : si la base fuit, les jetons ne sont pas utilisables.
function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Crée une session pour l'utilisateur et place le jeton dans un cookie HTTP-only.
export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId: userId,
      expiresAt: expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // inaccessible depuis JavaScript (protège contre le vol par XSS)
    secure: process.env.NODE_ENV === "production", // envoyé uniquement en HTTPS en production
    sameSite: "lax", // limite les requêtes venant d'autres sites (CSRF)
    path: "/",
    expires: expiresAt,
  });
}

// Supprime la session en base et efface le cookie (déconnexion).
export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Retourne l'utilisateur connecté, ou null si personne n'est connecté.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Session expirée : on la supprime
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  // On ne renvoie jamais le hash du mot de passe
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    createdAt: session.user.createdAt,
  };
}

// ---------- Validation ----------

export function isValidEmail(email: string) {
  // Vérification simple : quelque chose@quelque chose.extension
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
