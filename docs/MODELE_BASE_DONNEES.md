# Modèle de la base de données — CineHub

Base : **SQLite** (fichier `prisma/dev.db`), gérée avec **Prisma**.
Le schéma complet est dans `prisma/schema.prisma`.

## 1. Schéma relationnel

```
┌──────────────┐ 1      N ┌──────────────┐ N      1 ┌──────────────┐
│     User     │──────────│    Review    │──────────│    Movie     │
│──────────────│          │──────────────│          │──────────────│
│ id (PK)      │          │ id (PK)      │          │ id (PK)      │
│ name         │          │ userId (FK)  │          │ title        │
│ email (UQ)   │          │ movieId (FK) │          │ poster       │
│ passwordHash │          │ rating 1..5  │          │ description  │
│ createdAt    │          │ comment      │          │ genre        │
└──────┬───────┘          │ createdAt    │          │ releaseYear  │
       │                  │ updatedAt    │          │ director     │
       │                  └──────────────┘          │ duration     │
       │  1      N ┌──────────────┐ N      1        │ createdAt    │
       ├───────────│   Favorite   │─────────────────┤              │
       │           │ id, userId,  │                 │              │
       │           │ movieId,     │                 │              │
       │           │ createdAt    │                 │              │
       │           └──────────────┘                 │              │
       │  1      N ┌─────────────────┐ N      1     │              │
       ├───────────│ PersonalLibrary │──────────────┘              │
       │           │ id, userId,     │                └──────────────┘
       │           │ movieId,        │
       │           │ personalNote,   │
       │           │ status,         │
       │           │ createdAt,      │
       │           │ updatedAt       │
       │           └─────────────────┘
       │  1      N ┌──────────────┐
       └───────────│   Session    │
                   │ id, tokenHash│
                   │ userId,      │
                   │ expiresAt    │
                   └──────────────┘
```

PK = clé primaire, FK = clé étrangère, UQ = valeur unique.

## 2. Description des tables

### User — les comptes
| Champ | Type | Remarque |
|---|---|---|
| id | entier, auto-incrémenté | clé primaire |
| name | texte | 50 caractères maximum (vérifié par l'API) |
| email | texte | **unique**, enregistré en minuscules |
| passwordHash | texte | hash bcrypt, jamais le mot de passe en clair |
| createdAt | date | date d'inscription |

### Movie — le catalogue partagé
| Champ | Type | Remarque |
|---|---|---|
| id | entier | clé primaire |
| title, description, genre, director | texte | |
| poster | texte | chemin d'une image dans `public/images/posters/` |
| releaseYear | entier | année de sortie |
| duration | entier | durée en minutes |
| createdAt | date | |

**Il n'y a pas de colonne « note moyenne »** : elle est calculée à partir des avis.

### Review — les avis
| Champ | Type | Remarque |
|---|---|---|
| id | entier | clé primaire |
| userId → User.id | entier | auteur |
| movieId → Movie.id | entier | film noté |
| rating | entier | de 1 à 5 (vérifié par l'API) |
| comment | texte | 3 à 1000 caractères |
| createdAt, updatedAt | date | `updatedAt` est mis à jour automatiquement |

Contrainte **unique (userId, movieId)** : un seul avis par utilisateur et par film.

### Favorite — les favoris
| Champ | Type | Remarque |
|---|---|---|
| id | entier | clé primaire |
| userId, movieId | entiers | clés étrangères |
| createdAt | date | |

Contrainte **unique (userId, movieId)**.

### PersonalLibrary — la bibliothèque personnelle
| Champ | Type | Remarque |
|---|---|---|
| id | entier | clé primaire |
| userId, movieId | entiers | clés étrangères |
| personalNote | texte | 500 caractères maximum, peut être vide |
| status | texte | `TO_WATCH` (à voir), `WATCHING` (en cours), `WATCHED` (vu) |
| createdAt, updatedAt | date | |

Contrainte **unique (userId, movieId)**. SQLite ne gère pas les types `enum` avec Prisma, c'est
pourquoi `status` est un texte dont les valeurs autorisées sont vérifiées par l'API (`lib/library.ts`).

### Session — les connexions (table technique)
| Champ | Type | Remarque |
|---|---|---|
| tokenHash | texte unique | empreinte SHA-256 du jeton stocké dans le cookie |
| userId | entier | utilisateur connecté |
| expiresAt | date | expiration après 7 jours |

## 3. Relations

- Un **User** possède plusieurs **Review**, **Favorite**, **PersonalLibrary** et **Session** (1-N).
- Un **Movie** possède plusieurs **Review**, **Favorite** et **PersonalLibrary** (1-N).
- **Review**, **Favorite** et **PersonalLibrary** sont donc des tables d'association entre User et
  Movie, avec des informations en plus (note, statut…).
- `onDelete: Cascade` : supprimer un utilisateur ou un film supprime aussi les lignes liées.

## 4. Calcul de la note moyenne

```ts
export function calculateAverageRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) {
    return null; // "Pas encore noté"
  }
  let total = 0;
  for (const review of reviews) {
    total = total + review.rating;
  }
  return Math.round((total / reviews.length) * 10) / 10; // une décimale
}
```

Exemple : deux avis de 5 et 2 → (5 + 2) / 2 = **3,5**. Si l'avis de 2 devient 4 → **4,5**.

## 5. Commandes utiles

```bash
npx prisma migrate dev   # crée / met à jour la base à partir du schéma
npx prisma db seed       # ajoute les 15 films de démonstration (si le catalogue est vide)
npx prisma studio        # interface web pour voir le contenu des tables
```
