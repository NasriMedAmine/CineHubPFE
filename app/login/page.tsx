// Page de connexion (F02)
// Le paramètre "next" de l'URL indique où rediriger après la connexion
// (ex : /login?next=/library quand un visiteur essaie d'ouvrir sa bibliothèque).

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // On n'accepte qu'un chemin interne (commençant par un seul "/")
  // pour éviter une redirection vers un autre site.
  const redirectTo = next && next.startsWith("/") && !next.startsWith("//") ? next : "/movies";

  // Déjà connecté : pas besoin de se reconnecter
  const user = await getCurrentUser();
  if (user) {
    redirect(redirectTo);
  }

  return (
    <div className="form-card">
      <h1>Connexion</h1>
      {next && <p className="message-info">Connectez-vous pour accéder à cette fonctionnalité.</p>}
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
