# Guide de démonstration (5 à 10 minutes) — CineHub

## Avant la soutenance (préparation)

```bash
npm install
npx prisma migrate dev      # base + 15 films
npm run build
npm run start               # version de production -> PWA active
```

- Ouvrir <http://localhost:3000> dans **Chrome** ou **Edge**, visiter une fois `/`, `/movies` et 2 ou 3 fiches
  (pour remplir le cache hors ligne).
- Préparer un deuxième navigateur (ou une fenêtre de navigation privée) pour montrer un deuxième utilisateur.
- Optionnel : mettre une clé `ANTHROPIC_API_KEY` dans `.env.local` **avant** `npm run build` / `npm run start`
  pour montrer l'IA réelle. Sinon, montrer le mode « filtrage simple » et l'expliquer honnêtement.
- Avoir le code ouvert sur : `lib/auth.ts`, `app/api/reviews/[id]/route.ts`, `lib/movies.ts`, `public/sw.js`.

## Déroulé

### 1. Présentation (1 min)
« CineHub est une PWA pour découvrir des films, les noter et gérer sa liste. Elle est faite avec
Next.js, TypeScript, SQLite et Prisma. » Montrer l'accueil.

### 2. Visiteur (1 min)
- **Films** : grille responsive, affiches, notes.
- **Recherche** : taper « inter » → Interstellar ; choisir le genre « Comédie ».
- Ouvrir une fiche : le visiteur voit le message « Connectez-vous pour… ».
- Taper `/library` dans l'adresse → redirection vers la connexion.

### 3. Compte (1 min 30)
- **Inscription** : montrer une erreur (mots de passe différents), puis réussir.
- **Connexion** : redirection, le nom apparaît dans le menu.
- **Profil** : changer le nom.
- Dire : « le mot de passe est haché avec bcrypt, la session est dans un cookie HttpOnly ».

### 4. CRUD (2 min)
- Sur une fiche : **Ajouter aux favoris**, **Ajouter à ma bibliothèque** (statut « À voir »).
- **Publier un avis** 5 étoiles → la note moyenne apparaît.
- Dans le deuxième navigateur, un autre compte met 2 étoiles → la moyenne passe à 3.5.
- **Ma bibliothèque** : Modifier (statut « Vu », note perso) puis Supprimer → montre le C, R, U, D.
- Montrer `app/api/reviews/[id]/route.ts` : la recherche `findFirst({ where: { id, userId } })`
  empêche de modifier l'avis de quelqu'un d'autre.

### 5. Assistant IA (1 min)
- Cliquer sur l'exemple « Je veux un film d'action sorti après 2015 ».
- Avec clé : recommandations expliquées avec liens vers les fiches.
- Sans clé : montrer le message et le libellé « filtrage simple (sans IA) ».
- Dire : « la clé reste sur le serveur, le navigateur ne parle qu'à /api/ai/recommend ».

### 6. PWA et hors ligne (1 min 30)
- Montrer le bouton **⬇ Installer** (Chrome/Edge) ou l'icône d'installation dans la barre d'adresse.
- Outils de développement → *Application* → manifeste et service worker activé.
- Onglet *Network* → cocher **Offline** :
  - le bandeau « Vous êtes hors ligne » apparaît ;
  - une fiche déjà visitée s'ouvre quand même ;
  - une fiche jamais visitée affiche la page hors ligne ;
  - l'assistant IA est désactivé.
- Décocher Offline → tout refonctionne.

### 7. Mobile (30 s)
Outils de développement → mode appareil (375 px) : menu ☰, grille sur 2 colonnes.

### 8. Conclusion (30 s)
Rappeler : Next.js + TypeScript, CRUD avec contrôle des droits, SQLite, authentification sécurisée,
PWA installable avec hors ligne, IA côté serveur, prête pour un déploiement HTTPS.
Montrer `npm run test:api` (12 tests) si le temps le permet.

## En cas de problème

| Problème | Solution |
|---|---|
| Catalogue vide | `npx prisma db seed` |
| Pas de bouton Installer | Normal sur Firefox/Safari, ou si l'application est déjà installée ; utiliser le menu du navigateur |
| Le hors ligne ne marche pas | Vérifier qu'on est en `npm run start` (pas `dev`) et que les pages ont été visitées une fois en ligne |
| Erreur IA « service indisponible » | Vérifier la clé dans `.env.local` et la connexion internet ; sinon retirer la clé pour montrer le mode simple |
