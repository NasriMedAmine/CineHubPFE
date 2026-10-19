# Questions / réponses pour la soutenance — CineHub

### Pourquoi Next.js ?
Next.js est un framework basé sur React qui permet d'écrire **le frontend et le backend dans le même
projet** : les pages (dossier `app/`) et les routes API (`app/api/`). Il gère le rendu côté serveur
(les pages arrivent déjà remplies, c'est rapide et bon pour le référencement), le routage par dossiers
et l'optimisation pour la production. Pour un projet étudiant, cela évite de maintenir deux projets séparés.

### Pourquoi TypeScript ?
TypeScript ajoute des **types** à JavaScript. L'éditeur et la compilation signalent les erreurs avant
l'exécution (par exemple oublier un champ ou passer un texte à la place d'un nombre). Prisma génère
aussi les types des tables : si j'écris `movie.titel` au lieu de `movie.title`, la compilation échoue.

### Qu'est-ce que le CRUD ?
**C**reate, **R**ead, **U**pdate, **D**elete : les quatre opérations de base sur des données.
Dans CineHub, la bibliothèque personnelle en est l'exemple complet :
- Create : `POST /api/library` ;
- Read : la page `/library` ;
- Update : `PUT /api/library/[id]` ;
- Delete : `DELETE /api/library/[id]`.
Les avis suivent le même principe.

### Qu'est-ce qu'une PWA ?
Une **Progressive Web App** est un site web qui se comporte comme une application : on peut
l'**installer** (icône sur le bureau ou l'écran d'accueil, fenêtre sans barre d'adresse) et elle
peut fonctionner en partie **hors ligne**. Il faut pour cela un **manifeste**, un **service worker** et **HTTPS**.

### Qu'est-ce qu'un manifeste ?
Un fichier JSON (`public/manifest.webmanifest`) qui décrit l'application au navigateur : nom,
nom court, icônes (192×192 et 512×512), couleurs, page de démarrage et mode d'affichage (`standalone`).
Il est déclaré dans `app/layout.tsx` (`manifest: "/manifest.webmanifest"`).

### Qu'est-ce qu'un service worker ?
Un script JavaScript (`public/sw.js`) que le navigateur exécute **en arrière-plan**, séparé de la
page. Il peut **intercepter les requêtes** réseau et répondre avec des fichiers mis en cache. Il a un
cycle de vie : `install` (mise en cache de la page hors ligne et des icônes), `activate` (nettoyage
des anciens caches), puis `fetch` pour chaque requête.

### Comment fonctionne le mode hors ligne ?
- Pour les **pages publiques** : stratégie « réseau d'abord ». Quand on est en ligne, la page vient
  du serveur et une copie est gardée dans le cache. Hors ligne, la copie est utilisée.
- Pour les **fichiers statiques** (JS, CSS, affiches) : « cache d'abord ».
- Si une page n'est pas en cache : la page `/offline` est affichée.
- Les **API** et les pages privées ne sont jamais mises en cache.
- Un bandeau prévient l'utilisateur et l'assistant IA est désactivé.

Limite : les **modifications ne sont pas possibles hors ligne** (pas de synchronisation différée).

### Comment les mots de passe sont-ils protégés ?
- Ils ne sont **jamais stockés en clair** : on stocke un **hash bcrypt** (`lib/auth.ts`). bcrypt ajoute
  un « sel » aléatoire et est volontairement lent, ce qui rend les attaques par force brute coûteuses.
- À la connexion, `bcrypt.compare` compare le mot de passe saisi au hash.
- Le message d'erreur est le même si l'email ou le mot de passe est faux, pour ne pas révéler quels emails existent.
- La session est un jeton aléatoire dans un cookie **HttpOnly** (inaccessible au JavaScript),
  **SameSite=Lax** et **Secure** en production. En base, on ne garde que l'empreinte SHA-256 du jeton.

### Comment la note moyenne est-elle calculée ?
Elle **n'est pas stockée** dans la table `Movie`. À chaque affichage, on lit les notes des avis du
film et on calcule `somme / nombre d'avis`, arrondi à une décimale (`calculateAverageRating` dans
`lib/movies.ts`). Sans avis, on affiche « Pas encore noté ». Ainsi la moyenne est toujours exacte,
même après une modification ou une suppression d'avis.

### Comment fonctionne l'assistant IA ?
1. L'utilisateur écrit ses envies dans `/assistant`.
2. Le navigateur envoie `POST /api/ai/recommend` avec ce texte.
3. Le serveur vérifie la connexion et la longueur du texte.
4. Il lit le catalogue dans la base.
5. Il envoie au modèle Claude (API Anthropic) le catalogue + les préférences, en imposant une
   réponse JSON (titre, genre, explication, id du film).
6. Il vérifie que chaque id correspond à un vrai film du catalogue.
7. Le navigateur affiche les recommandations avec un lien vers chaque fiche.

Sans clé configurée, le serveur le dit clairement et fait un simple filtrage par mots-clés, présenté
comme « sans IA ».

### Pourquoi la clé de l'IA est-elle stockée côté serveur ?
Tout ce qui est envoyé au navigateur peut être lu par n'importe quel utilisateur (code source, outils
de développement). Si la clé était dans le code du frontend, quelqu'un pourrait la copier et l'utiliser
à nos frais. Elle est donc dans `.env.local` (non versionné), lue seulement par `lib/ai.ts`, qui
commence par `import "server-only"` pour empêcher toute importation côté client.

### Pourquoi HTTPS est-il nécessaire ?
- HTTPS **chiffre** les échanges : sans lui, le mot de passe et le cookie de session circuleraient en clair sur le réseau.
- Les **service workers** (donc le hors ligne et l'installation de la PWA) ne fonctionnent qu'en HTTPS
  (exception : `localhost` pour le développement).
- Le cookie de session a l'option `Secure` en production : il n'est envoyé que sur HTTPS.

### Comment empêchez-vous un utilisateur de modifier les données d'un autre ?
L'identité vient **toujours de la session**, jamais d'un champ envoyé par le navigateur. Pour modifier
ou supprimer, on cherche l'élément avec son `id` **et** `userId: user.id`. Si l'élément appartient à
quelqu'un d'autre, il n'est pas trouvé et le serveur répond 404. C'est vérifié par les tests automatiques.

### Pourquoi SQLite ?
C'est une base relationnelle complète stockée dans **un seul fichier**, sans serveur à installer :
idéal pour un projet universitaire. Avec Prisma, passer plus tard à PostgreSQL demanderait surtout de
changer le `provider` dans `schema.prisma`.

### Qu'avez-vous réellement testé ?
- Compilation (`npm run build`) et analyse ESLint (`npm run lint`) sans erreur.
- 12 tests automatiques des routes API (inscription, connexion, droits, CRUD, favoris, avis,
  moyenne, assistant sans clé, manifeste, déconnexion), tous réussis.
- Tests manuels dans le navigateur (inscription, connexion, avis, bibliothèque, assistant sans clé, affichage mobile).
- Mode hors ligne vérifié avec un navigateur piloté par script en coupant le serveur.
- **Non testé** : l'appel réel à l'API d'IA, faute de clé pendant le développement.
