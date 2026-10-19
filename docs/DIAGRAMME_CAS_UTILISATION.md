# Diagramme de cas d'utilisation — CineHub

## 1. Diagramme

```
                         ┌───────────────────────────── CineHub ─────────────────────────────┐
                         │                                                                    │
                         │   (Consulter l'accueil)                                            │
                         │   (Parcourir le catalogue)                                         │
     ┌─────────┐         │   (Rechercher un film par titre / genre)                           │
     │Visiteur │─────────│   (Voir le détail d'un film)                                       │
     └────┬────┘         │   (Lire les avis)                                                  │
          │              │   (S'inscrire)                                                     │
          │ hérite       │   (Se connecter)                                                   │
          ▼              │                                                                    │
  ┌──────────────┐       │   (Gérer son profil)                                               │
  │ Utilisateur  │───────│   (Gérer sa bibliothèque) ── inclut ── ajouter / lister /          │
  │  connecté    │       │                                        modifier / supprimer        │
  └──────────────┘       │   (Gérer ses favoris) ────── inclut ── ajouter / retirer           │
                         │   (Gérer ses avis) ───────── inclut ── publier / modifier /        │
                         │                                        supprimer                   │
                         │   (Demander une recommandation IA) ─── inclut ── (Interroger l'IA) │──── Service IA
                         │   (Se déconnecter)                                                 │     (Claude)
                         │   (Installer l'application)                                        │
                         └────────────────────────────────────────────────────────────────────┘
```

L'utilisateur connecté **hérite** de tous les cas d'utilisation du visiteur.
Le service d'IA est un **acteur secondaire** (système externe).

## 2. Actions du visiteur

| Cas d'utilisation | Description |
|---|---|
| Consulter l'accueil | Voir la présentation et les films à la une. |
| Parcourir le catalogue | Voir tous les films sous forme de cartes. |
| Rechercher un film | Saisir une partie du titre, choisir éventuellement un genre. |
| Voir le détail d'un film | Informations complètes, note moyenne, liste des avis. |
| Lire les avis | Les avis des utilisateurs sont publics. |
| S'inscrire | Créer un compte. |
| Se connecter | Ouvrir une session. |

Si un visiteur tente d'accéder à une page protégée (`/library`, `/favorites`, `/profile`,
`/assistant`), il est redirigé vers `/login?next=...`, puis renvoyé vers la page demandée après connexion.
Si un visiteur appelle directement une route API protégée, le serveur répond `401`.

## 3. Actions de l'utilisateur connecté

| Cas d'utilisation | Description |
|---|---|
| Gérer son profil | Voir nom, email, date d'inscription, statistiques ; modifier nom et email. |
| Gérer sa bibliothèque | Ajouter un film avec un statut, voir la liste (filtrable), modifier statut et note perso, supprimer. |
| Gérer ses favoris | Ajouter / retirer depuis la fiche, voir la liste, retirer depuis la liste. |
| Gérer ses avis | Publier un avis (1 à 5 étoiles + commentaire), le modifier, le supprimer. |
| Demander une recommandation | Décrire ses envies, recevoir des films avec une explication. |
| Se déconnecter | Fermer la session. |

## 4. Interactions principales (scénario nominal)

### Publier un avis
1. L'utilisateur ouvre la fiche d'un film.
2. Il choisit une note (étoiles) et écrit un commentaire, puis clique sur « Publier ».
3. Le navigateur envoie `POST /api/reviews`.
4. Le serveur vérifie la session, la note (1 à 5), le commentaire, l'existence du film et l'absence d'avis précédent.
5. L'avis est enregistré ; la page est rechargée et la note moyenne recalculée.

**Alternatives :** note invalide → message d'erreur ; avis déjà existant → message invitant à le modifier ;
hors ligne → message « Action impossible ».

### Ajouter un film à sa bibliothèque
1. Sur la fiche, l'utilisateur choisit un statut puis clique sur « Ajouter à ma bibliothèque ».
2. `POST /api/library` → vérification de la session, du statut, du film, et que le film n'y est pas déjà.
3. Le bouton devient « Dans ma bibliothèque ».

### Demander une recommandation
1. L'utilisateur écrit ses envies (ou clique sur un exemple).
2. `POST /api/ai/recommend` → vérification de la session et du texte.
3. Le serveur lit le catalogue et l'envoie avec la demande au service d'IA.
4. Les recommandations sont vérifiées puis affichées avec un lien vers la fiche.

**Alternatives :** pas de clé → filtrage simple annoncé comme « sans IA » ; erreur du service → message
« service indisponible » ; hors ligne → bouton désactivé.
