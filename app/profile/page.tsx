// Page profil (F04) — réservée aux utilisateurs connectés

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  // Quelques statistiques sur l'activité de l'utilisateur
  const reviewCount = await prisma.review.count({ where: { userId: user.id } });
  const favoriteCount = await prisma.favorite.count({ where: { userId: user.id } });
  const libraryCount = await prisma.personalLibrary.count({ where: { userId: user.id } });

  return (
    <div className="form-card">
      <h1>Mon profil</h1>
      <p className="muted">
        Membre depuis le {user.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <div className="tags">
        <span className="tag">⭐ {reviewCount} avis</span>
        <span className="tag">❤️ {favoriteCount} favoris</span>
        <span className="tag">📚 {libraryCount} films dans ma bibliothèque</span>
      </div>

      <ProfileForm initialName={user.name} initialEmail={user.email} />
    </div>
  );
}
