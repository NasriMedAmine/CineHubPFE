// POST /api/ai/recommend : recommandations de films par l'assistant IA
//
// Étapes :
// 1. Vérifier que l'utilisateur est connecté
// 2. Valider le texte envoyé
// 3. Récupérer les films du catalogue
// 4. Envoyer les préférences + le catalogue à l'IA (ou filtrage simple si pas de clé)
// 5. Renvoyer les recommandations au navigateur

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMovies } from "@/lib/movies";
import { askAiForRecommendations, basicCatalogFilter, isAiConfigured } from "@/lib/ai";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Vous devez être connecté pour utiliser l'assistant." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const preferences = String(body?.preferences ?? "").trim();

  if (preferences.length < 3 || preferences.length > 500) {
    return NextResponse.json(
      { error: "Décrivez vos envies en 3 à 500 caractères." },
      { status: 400 }
    );
  }

  const movies = await getMovies();

  // Pas de clé API : on le dit clairement et on propose un filtrage simple (pas de l'IA)
  if (!isAiConfigured()) {
    return NextResponse.json({
      mode: "fallback",
      message:
        "L'assistant IA n'est pas configuré (variable ANTHROPIC_API_KEY absente). " +
        "Voici un simple filtrage du catalogue par mots-clés, ce n'est pas une réponse d'IA.",
      recommendations: basicCatalogFilter(preferences, movies),
    });
  }

  try {
    const recommendations = await askAiForRecommendations(preferences, movies);
    return NextResponse.json({ mode: "ai", recommendations: recommendations });
  } catch (error) {
    console.error("Erreur de l'assistant IA :", error);
    return NextResponse.json(
      { error: "Le service d'IA est indisponible pour le moment. Réessayez plus tard." },
      { status: 502 }
    );
  }
}
