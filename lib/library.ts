// Statuts possibles pour un film de la bibliothèque personnelle.
// Ce fichier peut être utilisé côté serveur ET côté client.

export const LIBRARY_STATUSES = ["TO_WATCH", "WATCHING", "WATCHED"];

// Libellés affichés à l'utilisateur
export const STATUS_LABELS: Record<string, string> = {
  TO_WATCH: "À voir",
  WATCHING: "En cours",
  WATCHED: "Vu",
};
