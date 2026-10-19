# 🎬 CineHub — Application web progressive (PWA)

Projet universitaire réalisé avec **Next.js**, **TypeScript**, **SQLite** et **Prisma**.

---

## 1. Présentation du projet

CineHub est une application web qui permet de **découvrir des films**, de **publier des avis**, de
**gérer une bibliothèque personnelle** (films à voir, en cours, vus) et de recevoir des
**recommandations d'un assistant IA**.

C'est une **PWA (Progressive Web App)** : elle peut être installée sur un ordinateur ou un téléphone
comme une application classique, et les pages déjà consultées restent accessibles sans connexion.

Le projet a été développé dans le cadre d'un module universitaire pour mettre en pratique, dans une
seule application cohérente, les notions vues en cours : développement web moderne, base de données,
authentification, CRUD, PWA et intégration d'une IA côté serveur.

## 2. Objectifs

Les objectifs pédagogiques du projet sont :

- utiliser un framework moderne (**Next.js**, App Router) et le langage **TypeScript** ;
- découper l'interface en **composants React** réutilisables ;
- réaliser une interface **responsive** (mobile d'abord) ;
- implémenter des opérations **CRUD** complètes (Create, Read, Update, Delete) ;
- **persister les données** dans une base relationnelle (SQLite) ;
- mettre en place une **authentification** sécurisée (mots de passe hachés, cookie de session) ;
- transformer le site en **PWA** installable avec un **mode hors ligne** ;
- appeler un **service d'IA côté serveur** sans exposer la clé d'API ;
- préparer un **déploiement en HTTPS**.

## 3. Technologies utilisées

| Technologie | Rôle dans le projet |
|---|---|
| **Next.js 16** (App Router) | Framework React qui gère à la fois les pages (frontend) et les routes API (backend). |
| **React 19** | Construction de l'interface avec des composants. |
| **TypeScript** | JavaScript avec des types : beaucoup d'erreurs sont détectées avant l'exécution. |
| **SQLite** | Base de données stockée dans un simple fichier (`prisma/dev.db`). Pas de serveur à installer. |
| **Prisma 6** | ORM : permet de lire/écrire dans la base avec des fonctions TypeScript au lieu d'écrire du SQL. |
| **bcryptjs** | Hachage des mots de passe. |
| **Service Worker + Manifest** | Fonctionnement en PWA : installation et cache hors ligne. |
| **SDK Anthropic (Claude)** | Appel du modèle d'IA, uniquement depuis le serveur. |
| **CSS global** | Un seul fichier `app/globals.css`, thème sombre « salle de cinéma ». |

Aucun framework CSS, aucune librairie de gestion d'état : seulement les hooks React (`useState`, `useEffect`).

## 4. Acteurs

**Visiteur (non connecté)**
- consulte la page d'accueil et le catalogue ;
- ouvre la fiche d'un film et lit les avis ;
- recherche un film par titre (et par genre) ;
- doit s'inscrire ou se connecter pour le reste.

**Utilisateur connecté**
- tout ce que fait le visiteur ;
- consulte et modifie son profil ;
- gère sa bibliothèque personnelle (ajout, modification, suppression) ;
- ajoute / retire des favoris ;
- publie, modifie et supprime **ses** avis ;
- utilise l'assistant IA ;
- se déconnecte.

Un utilisateur ne peut **jamais** modifier les données d'un autre utilisateur : chaque requête de
modification vérifie que l'élément appartient bien à l'utilisateur de la session.

## 5. Fonctionnalités

| Code | Fonctionnalité | Où ? |
|---|---|---|
| F01 | Inscription (nom, email, mot de passe + confirmation, vérifications, email unique) | `/register` |
| F02 | Connexion (session sécurisée, message d'erreur clair) | `/login` |
| F03 | Déconnexion (session supprimée en base + cookie effacé) | bouton dans le menu |
| F04 | Profil (nom, email, date d'inscription, modification) | `/profile` |
| F06 | Catalogue en grille responsive, état de chargement et état vide | `/movies` |
| F07 | Détail d'un film (affiche, infos, note moyenne, avis, actions) | `/movies/[id]` |
| F08 | Recherche par titre insensible à la casse + filtre par genre | `/search` |
| — | Bibliothèque personnelle (CRUD complet, statut + note perso, filtre par statut) | `/library` |
| — | Favoris (ajout, liste, retrait) | `/favorites` |
| — | Avis (note 1 à 5 + commentaire, un avis par film et par utilisateur) | fiche d'un film |
| — | Note moyenne calculée à partir des vrais avis | partout |
| — | Assistant IA de recommandation | `/assistant` |
| — | PWA installable + mode hors ligne | tout le site |

**Catalogue partagé et bibliothèque personnelle :** le catalogue (table `Movie`) est commun à tout
le monde. La bibliothèque (table `PersonalLibrary`) contient les entrées propres à chaque utilisateur :
un film du catalogue + un statut + une note personnelle. C'est sur ces entrées que porte le CRUD.

## 6. Architecture

```
            NAVIGATEUR                                   SERVEUR NEXT.JS
 ┌──────────────────────────────┐           ┌──────────────────────────────────────┐
 │ Pages React (app/...)        │  HTML     │ Pages serveur (page.tsx)             │
 │ Composants (components/)     │ ◄──────── │   lisent la base avec Prisma         │
 │                              │           │                                      │
 │ Formulaires "use client"     │  fetch    │ Routes API (app/api/.../route.ts)    │
 │  (connexion, avis, biblio…)  │ ────────► │   vérifient la session               │
 │                              │  JSON     │   valident les données               │──► SQLite
 │ Service worker (sw.js)       │ ◄──────── │   écrivent en base (Prisma)          │   (dev.db)
 │  cache des pages visitées    │           │                                      │
 └──────────────────────────────┘           │ /api/ai/recommend ───────────────────│──► API Claude
                                            └──────────────────────────────────────┘
```

- Les **pages** sont des composants serveur : elles lisent directement la base avec Prisma.
- Les parties interactives (formulaires, boutons) sont des **composants client** (`"use client"`)
  qui appellent les **routes API** avec `fetch`.
- Les routes API correspondent aux opérations CRUD : `POST` = créer, `PUT` = modifier, `DELETE` = supprimer.

Organisation des fichiers :

```
v1/
├── app/                    pages et routes API (App Router)
│   ├── api/                backend : auth, profile, favorites, library, reviews, ai
│   ├── movies/             catalogue + fiche d'un film ([id])
│   ├── login/ register/ profile/ favorites/ library/ assistant/ search/ offline/
│   ├── layout.tsx          structure commune (menu, bandeau hors ligne, pied de page)
│   └── globals.css         styles
├── components/             Navbar, MovieCard, SearchBar, ReviewCard, RatingStars, ...
├── lib/                    prisma.ts, auth.ts, movies.ts, library.ts, ai.ts (code serveur)
├── prisma/                 schema.prisma, migrations, seed.ts
├── public/                 manifest.webmanifest, sw.js, icônes, affiches
├── tests/                  tests automatiques des routes API
└── docs/                   documentation pour la soutenance
```

Plus de détails : [docs/ARCHITECTURE_SIMPLE.md](docs/ARCHITECTURE_SIMPLE.md).

## 7. Base de données

Cinq tables principales (+ une table technique `Session`) :

- **User** : les comptes (le mot de passe est stocké sous forme de hash).
- **Movie** : le catalogue partagé.
- **Review** : les avis (note de 1 à 5 + commentaire). Unicité `(userId, movieId)`.
- **Favorite** : les favoris. Unicité `(userId, movieId)`.
- **PersonalLibrary** : la bibliothèque (statut `TO_WATCH` / `WATCHING` / `WATCHED` + note perso).
- **Session** : les sessions de connexion (empreinte du jeton + date d'expiration).

Un utilisateur a plusieurs avis, favoris et entrées de bibliothèque (relations 1-N) ; un film aussi.
Si un utilisateur ou un film est supprimé, ses données liées sont supprimées (`onDelete: Cascade`).

**La note moyenne n'est pas stockée** : elle est recalculée à partir des avis (fonction
`calculateAverageRating` dans `lib/movies.ts`). Elle est donc toujours juste.

Détails : [docs/MODELE_BASE_DONNEES.md](docs/MODELE_BASE_DONNEES.md).

## 8. Installation

Prérequis : **Node.js 20 ou plus récent** (testé avec Node.js 24) et npm.

```bash
# 1. Installer les dépendances
npm install

# 2. Créer les fichiers de configuration
#    .env        -> DATABASE_URL (lu par Prisma)
#    .env.local  -> ANTHROPIC_API_KEY (optionnelle, pour l'assistant IA)
cp .env.example .env
cp .env.example .env.local

# 3. Créer la base SQLite, appliquer les migrations et ajouter les films de démonstration
npx prisma migrate dev

# (si les films n'ont pas été ajoutés automatiquement)
npx prisma db seed

# 4. Lancer en mode développement
npm run dev
```

L'application est alors disponible sur <http://localhost:3000>.

> Sous Windows (PowerShell), remplacer `cp` par `copy`.
> Si npm affiche un avertissement « allow-scripts », les scripts nécessaires (Prisma, esbuild) sont
> déjà autorisés dans `package.json` (section `allowScripts`).

Pour tester la **version de production** (nécessaire pour la PWA, voir section 10) :

```bash
npm run build
npm run start
```

## 9. Utilisation

1. Ouvrir l'accueil puis **Films** : le catalogue s'affiche (15 films de démonstration).
2. Tester la **recherche** : taper « inter » (ou « INTER ») → Interstellar.
3. Ouvrir une fiche : en tant que visiteur, un message invite à se connecter.
4. **S'inscrire** (`/register`), puis **se connecter**.
5. Sur une fiche de film : ajouter aux **favoris**, ajouter à la **bibliothèque**, publier un **avis**.
6. Vérifier que la **note moyenne** change ; modifier puis supprimer l'avis.
7. Aller dans **Ma bibliothèque** : modifier le statut et la note personnelle, filtrer, supprimer.
8. Aller dans **Profil** : modifier le nom.
9. Essayer l'**assistant IA**.
10. Se **déconnecter**.

Tests automatiques des routes API (l'application doit être lancée) :

```bash
npm run test:api
```

Ces tests créent deux comptes de test, vérifient le CRUD, les droits d'accès, le calcul de la moyenne,
puis suppriment leurs avis et entrées (les comptes de test restent dans la base).

Scénarios détaillés : [docs/SCENARIOS_TEST.md](docs/SCENARIOS_TEST.md).

## 10. PWA

**Le manifeste** (`public/manifest.webmanifest`) décrit l'application au navigateur : nom, icônes
192×192 et 512×512, couleurs, page de démarrage, mode `standalone` (sans barre d'adresse).

**Le service worker** (`public/sw.js`) est un script qui tourne en arrière-plan et intercepte les requêtes :

| Type de requête | Stratégie |
|---|---|
| Pages publiques (`/`, `/movies`, `/movies/[id]`, `/search`) | réseau d'abord, copie en cache, cache si hors ligne |
| Fichiers statiques (JS, CSS, affiches, icônes) | cache d'abord |
| Pages privées (profil, favoris, bibliothèque, assistant) | réseau uniquement, page `/offline` si échec |
| Routes API, POST/PUT/DELETE, connexion | jamais mis en cache |

**Installation :** sur Chrome / Edge (ordinateur et Android), un bouton « ⬇ Installer » apparaît dans
le menu quand le navigateur le permet. Sur Safari (iPhone/iPad) il faut utiliser
« Partager → Sur l'écran d'accueil ». Firefox sur ordinateur ne propose pas l'installation de PWA.

**Limites du mode hors ligne (honnêtement) :**
- seules les pages **déjà visitées** sont disponibles ; les autres affichent la page « hors ligne » ;
- les **modifications** (avis, favoris, bibliothèque, profil) ne fonctionnent pas hors ligne : il n'y
  a pas de synchronisation différée ;
- l'**assistant IA** est désactivé hors ligne ;
- le service worker n'est activé qu'en **production** (`npm run build` + `npm run start`), pas avec `npm run dev` ;
- une page publique mise en cache peut afficher l'état de connexion au moment de la visite ; le
  cache des pages est vidé lors de la déconnexion.

## 11. Assistant IA

```
Navigateur                    Serveur Next.js                         API Anthropic
──────────                    ───────────────                         ─────────────
AssistantForm  ── POST ──►  /api/ai/recommend
{ preferences }              1. utilisateur connecté ?
                             2. texte valide (3 à 500 caractères) ?
                             3. lecture du catalogue (Prisma)
                             4. clé configurée ? ──── oui ────────►   modèle Claude
                                                                      (réponse JSON imposée)
                             5. vérification : les id de films ◄────
                                existent-ils dans le catalogue ?
               ◄── JSON ──   { mode: "ai", recommendations: [...] }
```

- La clé `ANTHROPIC_API_KEY` est dans `.env.local`, lue **uniquement sur le serveur** (`lib/ai.ts`
  commence par `import "server-only"`). Elle n'est jamais envoyée au navigateur.
- Le modèle utilisé par défaut est `claude-opus-5-5` (modifiable avec `AI_MODEL`).
- La réponse est imposée au format JSON (titre, genre, explication, id du film) pour être facile à afficher.
- Les recommandations pointent en priorité vers des films du catalogue ; un id inventé est ignoré.
- La requête active l'option de **repli automatique** de l'API (`fallbacks: "default"`) : si le
  modèle refuse une demande, l'API peut essayer un autre modèle.
- **Sans clé**, la page l'indique clairement et propose un **simple filtrage par mots-clés**
  (genre, année, titre cité), affiché comme « Résultats du filtrage simple (sans IA) ».

> Remarque : pendant le développement, l'appel réel à l'API d'IA n'a pas pu être testé (aucune clé
> configurée). Le mode sans clé et la validation des demandes ont été testés.

## 12. Déploiement HTTPS

Aucune plateforme ni nom de domaine n'est imposé pour ce projet. Le guide complet est dans
[docs/DEPLOIEMENT_HTTPS.md](docs/DEPLOIEMENT_HTTPS.md). En résumé :

1. Serveur avec Node.js et un **disque persistant** (le fichier SQLite doit survivre aux redémarrages).
2. `npm ci`, configuration de `.env` / `.env.local`, `npx prisma migrate deploy`, `npx prisma db seed`.
3. `npm run build` puis `npm run start` (port 3000), idéalement géré par un gestionnaire de processus.
4. Un **reverse proxy** (Nginx, Caddy…) avec un **certificat TLS** (par exemple Let's Encrypt)
   qui redirige HTTP vers HTTPS.

HTTPS est indispensable : les **service workers** ne fonctionnent qu'en HTTPS (sauf sur `localhost`)
et le cookie de session est marqué `Secure` en production.

## 13. Difficultés rencontrées

- **Next.js 16 :** `params`, `searchParams` et `cookies()` sont asynchrones (il faut les `await`),
  ce qui diffère de nombreux exemples trouvés en ligne.
- **Recherche insensible à la casse :** avec SQLite, Prisma ne propose pas l'option
  `mode: "insensitive"`. Le filtrage est donc fait en TypeScript après la lecture (acceptable car le catalogue est petit).
- **Service worker et Next.js :** en développement, le cache gênait le rechargement du code ; le
  service worker n'est donc enregistré qu'en production. Il a fallu aussi décider précisément quelles
  pages mettre en cache pour ne pas conserver de données privées.
- **Vérifier le mode hors ligne :** il faut construire la version de production, visiter les pages,
  puis couper le serveur pour constater que les pages en cache s'affichent toujours.
- **Sécurité des droits :** chaque route de modification recherche l'élément avec son `id` **et**
  l'`id` de l'utilisateur de la session, pour qu'un utilisateur ne puisse pas modifier les données d'un autre.

## 14. Améliorations futures

- Synchronisation hors ligne (enregistrer les actions et les envoyer au retour de la connexion).
- Ajout de films au catalogue par un rôle administrateur.
- Pagination du catalogue et recherche côté base de données si le catalogue grandit.
- Réinitialisation du mot de passe par email.
- Limitation du nombre de requêtes (connexion, assistant IA).
- Vraies affiches de films (avec les droits nécessaires) ou import depuis une API de films.
- Tests de l'interface (par exemple avec Playwright).

## 15. Conclusion

CineHub montre une application complète mais compréhensible : un frontend React en TypeScript, un
backend avec des routes API, une base relationnelle SQLite, une authentification sécurisée, des
opérations CRUD avec contrôle des droits, un fonctionnement en PWA installable avec un mode hors
ligne réaliste, et une intégration d'IA côté serveur qui protège la clé d'API.

---

📁 Documentation complémentaire (dossier `docs/`) :
[Cahier des charges](docs/CAHIER_DES_CHARGES.md) ·
[Cas d'utilisation](docs/DIAGRAMME_CAS_UTILISATION.md) ·
[Base de données](docs/MODELE_BASE_DONNEES.md) ·
[Architecture](docs/ARCHITECTURE_SIMPLE.md) ·
[Scénarios de test](docs/SCENARIOS_TEST.md) ·
[Guide de démonstration](docs/GUIDE_DEMONSTRATION.md) ·
[Questions / réponses](docs/QUESTIONS_REPONSES_SOUTENANCE.md) ·
[Déploiement HTTPS](docs/DEPLOIEMENT_HTTPS.md)

**Crédits :** les affiches sont des illustrations originales générées pour le projet (formes et
titres), pas les affiches officielles des films. Aucun avis n'est pré-rempli : toutes les notes
viennent des utilisateurs.
