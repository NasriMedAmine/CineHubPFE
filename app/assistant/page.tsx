// Assistant IA — réservé aux utilisateurs connectés

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isAiConfigured } from "@/lib/ai";
import AssistantForm from "./AssistantForm";

export default async function AssistantPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/assistant");
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1>🤖 Assistant CineHub</h1>
      <p className="muted">
        Décrivez vos envies et l&apos;assistant vous propose des films, en priorité parmi ceux du catalogue.
      </p>

      {!isAiConfigured() && (
        <p className="message-info">
          ⚠️ Aucune clé d&apos;API IA n&apos;est configurée sur le serveur (variable <code>ANTHROPIC_API_KEY</code>{" "}
          dans <code>.env.local</code>). En attendant, l&apos;assistant utilise un simple filtrage par mots-clés,
          qui n&apos;est pas de l&apos;intelligence artificielle.
        </p>
      )}

      <AssistantForm />
    </div>
  );
}
