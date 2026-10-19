// POST /api/auth/logout : déconnexion (F03)

import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  await deleteSession();
  return NextResponse.json({ message: "Déconnexion réussie." });
}
