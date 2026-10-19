# Architecture simple — CineHub

## 1. Vue d'ensemble

CineHub est **une seule application Next.js** qui contient à la fois le frontend et le backend.
Il n'y a pas de microservices : un seul processus Node.js et un fichier SQLite.

```
┌──────────────────────── Navigateur ────────────────────────┐
│  Pages HTML + composants React                              │
│  Composants client ("use client") → fetch("/api/...")       │
│  Service worker (sw.js) → cache des pages et fichiers       │
└───────────────┬─────────────────────────────▲───────────────┘
                │ requêtes HTTP(S)            │ HTML / JSON
┌───────────────▼─────────────────────────────┴───────────────┐
│                     Serveur Next.js                         │
│  Pages serveur (app/**/page.tsx)    Routes API (app/api)    │
│            │                                │               │
│            └──────────── lib/ ──────────────┘               │
│        prisma.ts   auth.ts   movies.ts   library.ts  ai.ts  │
└───────────────┬────────────────────────────────┬────────────┘
                │ Prisma                         │ HTTPS (SDK)
          ┌─────▼─────┐                   ┌──────▼──────┐
          │  SQLite   │                   │ API Claude  │
          │  dev.db   │                   │ (Anthropic) │
          └───────────┘                   └─────────────┘
```

## 2. Les trois types de code

| Type | Où | Rôle | Exemple |
|---|---|---|---|
| **Page serveur** | `app/**/page.tsx` (sans `"use client"`) | Lit la base et renvoie du HTML. | `app/movies/page.tsx` appelle `getMovies()` |
| **Composant client** | fichiers avec `"use client"` | Interactivité : formulaires, boutons, `useState`. | `app/movies/[id]/ReviewSection.tsx` |
| **Route API** | `app/api/**/route.ts` | Reçoit du JSON, vérifie, écrit en base, répond en JSON. | `app/api/reviews/route.ts` |

Le dossier `lib/` contient le code serveur partagé. `lib/auth.ts`, `lib/movies.ts` et `lib/ai.ts`
commencent par `import "server-only"` : si un composant client les importait par erreur, la
compilation échouerait. C'est une protection pour la clé d'API et la base de données.

## 3. Les routes API (CRUD)

| Méthode | Route | Action | Connexion requise |
|---|---|---|---|
| POST | `/api/auth/register` | créer un compte | non |
| POST | `/api/auth/login` | se connecter | non |
| POST | `/api/auth/logout` | se déconnecter | — |
| PUT | `/api/profile` | modifier son profil | oui |
| POST | `/api/library` | **C**réer une entrée de bibliothèque | oui |
| PUT | `/api/library/[id]` | **U**pdate : modifier une entrée | oui (propriétaire) |
| DELETE | `/api/library/[id]` | **D**elete : supprimer une entrée | oui (propriétaire) |
| POST | `/api/favorites` | ajouter un favori | oui |
| DELETE | `/api/favorites/[movieId]` | retirer un favori | oui |
| POST | `/api/reviews` | publier un avis | oui |
| PUT | `/api/reviews/[id]` | modifier son avis | oui (auteur) |
| DELETE | `/api/reviews/[id]` | supprimer son avis | oui (auteur) |
| POST | `/api/ai/recommend` | recommandations IA | oui |

Le **R** (Read) du CRUD est fait par les pages serveur (`/library`, `/favorites`, `/movies/[id]`).

Toutes les routes suivent le même schéma, facile à expliquer :

```ts
export async function POST(request: Request) {
  const user = await getCurrentUser();           // 1. qui fait la demande ?
  if (!user) return 401;
  const body = await request.json();             // 2. lire les données
  if (données invalides) return 400;             // 3. valider
  await prisma.xxx.create({ ... userId: user.id }); // 4. écrire (avec l'id de la session)
  return NextResponse.json({ message: "..." });  // 5. répondre
}
```

## 4. Authentification

1. **Inscription :** le mot de passe est haché avec `bcrypt` (10 tours) avant d'être enregistré.
2. **Connexion :** `bcrypt.compare` vérifie le mot de passe. Si c'est bon, le serveur :
   - génère un jeton aléatoire de 32 octets (`crypto.randomBytes`) ;
   - enregistre son **empreinte SHA-256** dans la table `Session` avec une date d'expiration (7 jours) ;
   - place le jeton dans un cookie `cinehub_session` : `HttpOnly`, `SameSite=Lax`, `Secure` en production.
3. **À chaque requête :** `getCurrentUser()` lit le cookie, calcule l'empreinte et cherche la session.
4. **Déconnexion :** la session est supprimée de la base et le cookie est effacé. L'ancien jeton ne
   fonctionne plus, même si quelqu'un l'a copié.

Les pages privées appellent `getCurrentUser()` et redirigent vers `/login?next=...` si personne n'est connecté.

## 5. PWA

- `public/manifest.webmanifest` : description de l'application (nom, icônes, couleurs, `standalone`).
- `public/sw.js` : service worker (cache des pages publiques visitées et des fichiers statiques).
- `components/ServiceWorkerRegister.tsx` : enregistre le service worker (en production uniquement).
- `components/OfflineIndicator.tsx` : bandeau quand `navigator.onLine` est faux.
- `components/InstallButton.tsx` : bouton d'installation si l'événement `beforeinstallprompt` est reçu.
- `app/offline/page.tsx` : page affichée quand une page n'est pas disponible hors ligne.

## 6. Assistant IA

`app/assistant/AssistantForm.tsx` → `POST /api/ai/recommend` → `lib/ai.ts` → API Claude.
La clé est lue dans `process.env.ANTHROPIC_API_KEY` sur le serveur uniquement.
Voir la section 11 du README pour le détail.

## 7. Pourquoi cette architecture ?

- **Un seul projet** : plus simple à installer, comprendre et déployer.
- **Séparation claire** entre ce qui s'exécute dans le navigateur et sur le serveur.
- **Sécurité** : toute vérification importante est faite côté serveur, jamais seulement dans le navigateur.
- **Suffisant pour le besoin** : SQLite et un serveur Node.js suffisent pour un projet de cette taille.
