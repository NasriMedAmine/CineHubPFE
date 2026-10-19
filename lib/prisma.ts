// Connexion unique à la base de données via Prisma.
// En développement, Next.js recharge souvent les fichiers : on garde le client
// dans une variable globale pour ne pas ouvrir une nouvelle connexion à chaque fois.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
