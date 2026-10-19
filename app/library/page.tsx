// Ma bibliothèque personnelle (CRUD) — réservée aux utilisateurs connectés
//
// Différence avec le catalogue :
// - le catalogue (table Movie) est partagé et identique pour tout le monde ;
// - la bibliothèque (table PersonalLibrary) contient MES entrées : un film du
//   catalogue + mon statut (à voir / en cours / vu) + ma note personnelle.

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/library";
import LibraryItem from "./LibraryItem";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/library");
  }

  const { status } = await searchParams;
  const selectedStatus = status && STATUS_LABELS[status] ? status : "";

  // Read : on lit uniquement les entrées de l'utilisateur connecté
  const entries = await prisma.personalLibrary.findMany({
    where: {
      userId: user.id,
      ...(selectedStatus ? { status: selectedStatus } : {}),
    },
    include: { movie: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <div className="section-title">
        <h1>📚 Ma bibliothèque</h1>
        <span className="muted">{entries.length} film{entries.length > 1 ? "s" : ""}</span>
      </div>

      {/* Filtre par statut (simples liens) */}
      <div className="filters">
        <Link href="/library" className={selectedStatus === "" ? "button button-small" : "button button-secondary button-small"}>
          Tous
        </Link>
        {Object.keys(STATUS_LABELS).map((key) => (
          <Link
            key={key}
            href={`/library?status=${key}`}
            className={selectedStatus === key ? "button button-small" : "button button-secondary button-small"}
          >
            {STATUS_LABELS[key]}
          </Link>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <p>Aucun film dans cette liste.</p>
          <p>Ouvrez la fiche d&apos;un film et cliquez sur « Ajouter à ma bibliothèque ».</p>
          <Link href="/movies" className="button">
            Parcourir le catalogue
          </Link>
        </div>
      ) : (
        <div className="library-list">
          {entries.map((entry) => (
            <LibraryItem
              key={entry.id}
              entry={{
                id: entry.id,
                status: entry.status,
                personalNote: entry.personalNote,
                updatedAt: entry.updatedAt.toLocaleDateString("fr-FR"),
                movie: {
                  id: entry.movie.id,
                  title: entry.movie.title,
                  poster: entry.movie.poster,
                  genre: entry.movie.genre,
                  releaseYear: entry.movie.releaseYear,
                },
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
