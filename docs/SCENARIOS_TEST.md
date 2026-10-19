# Scénarios de test — CineHub

## 1. Comment tester

| Type de test | Commande / méthode |
|---|---|
| Compilation + vérification des types | `npm run build` |
| Analyse du code (ESLint) | `npm run lint` |
| Tests automatiques des routes API (12 tests) | lancer l'application (`npm run start` ou `npm run dev`), puis `npm run test:api` |
| Tests manuels | dans le navigateur, en suivant le tableau ci-dessous |

Les tests automatiques sont dans `tests/api.test.mjs`. Ils utilisent le lanceur de tests intégré à
Node.js (`node --test`), sans dépendance supplémentaire.

## 2. Résultats lors du développement (19/10/2026)

- `npm run build` : ✅ réussi, sans erreur TypeScript.
- `npm run lint` : ✅ aucune erreur ni avertissement.
- `npm run test:api` sur la version de production : ✅ **12 tests réussis sur 12**.
- Tests manuels dans le navigateur (version de production) : voir la colonne « Vérifié » ci-dessous.
- Mode hors ligne : vérifié avec un navigateur Edge sans interface piloté par script (visite des
  pages, puis arrêt du serveur).

## 3. Scénarios

Légende de la colonne « Vérifié » :
**Auto** = test automatique · **Manuel** = testé dans le navigateur · **Non testé** = pas encore vérifié.

| # | Scénario | Étapes | Résultat attendu | Vérifié |
|---|---|---|---|---|
| 1 | Le visiteur ouvre l'accueil | Aller sur `/` | Présentation, boutons, films à la une | Manuel |
| 2 | Le visiteur parcourt le catalogue | Aller sur `/movies` | 15 cartes avec affiche, titre, genre, année, note | Auto + Manuel |
| 3 | Le visiteur cherche par titre | `/search`, taper « INTER » | Interstellar trouvé ; « zzzzzz » → « Aucun film ne correspond » | Auto |
| 4 | Le visiteur ouvre une fiche | Cliquer sur « Détails » | Toutes les infos + avis + invitation à se connecter | Manuel |
| 5 | Le visiteur tente une action protégée | Appeler `/api/favorites`, `/api/reviews`, `/api/ai/recommend` sans session | Réponse 401 | Auto |
| 6 | Inscription | `/register` avec des données valides | Message « compte créé avec succès » | Auto + Manuel |
| 6b | Inscription invalide | Email invalide, mot de passe trop court, confirmation différente, email déjà pris | Messages d'erreur (400 / 409) | Auto |
| 7 | Connexion | `/login` | Redirection vers la page demandée, nom dans le menu | Auto + Manuel |
| 7b | Mauvais mot de passe | `/login` | « Email ou mot de passe incorrect » (401) | Auto |
| 8 | Modification du profil | `/profile`, changer le nom | Nom mis à jour ; email d'un autre compte refusé (409) | Auto |
| 9 | Ajout à la bibliothèque | Fiche → statut → « Ajouter à ma bibliothèque » | Le film apparaît dans `/library` ; doublon refusé (409) | Auto + Manuel |
| 10 | Modification d'une entrée | `/library` → Modifier → statut « Vu » → Enregistrer | Badge « Vu » | Auto + Manuel |
| 11 | Suppression d'une entrée | `/library` → Supprimer | L'entrée disparaît | Auto |
| 12 | Favoris | Fiche → « Ajouter aux favoris », puis retirer | Le film apparaît puis disparaît de `/favorites` | Auto + Manuel (ajout) |
| 13 | Publication d'un avis | Fiche → étoiles + commentaire → Publier | « Mon avis » s'affiche ; note hors 1-5 refusée | Auto + Manuel |
| 14 | Modification de son avis | Mon avis → Modifier | Avis mis à jour | Auto |
| 15 | Suppression de son avis | Mon avis → Supprimer | Avis supprimé | Auto |
| 16 | Mise à jour de la note moyenne | Deux utilisateurs notent 5 et 2, puis 2 devient 4 | Moyenne 3.5 puis 4.5 ; sans avis : « Pas encore noté » | Auto + Manuel |
| 16b | Droits sur les données d'autrui | B essaie de modifier l'avis / l'entrée de A | Réponse 404, rien n'est modifié | Auto |
| 17 | Assistant IA configuré | Clé dans `.env.local`, demande « film d'action après 2015 » | Recommandations de l'IA avec explications | **Non testé** (aucune clé disponible) |
| 17b | Assistant sans clé | Même demande sans clé | Message clair + « filtrage simple (sans IA) » : Top Gun: Maverick | Auto + Manuel |
| 17c | Demande invalide | Texte de 1 caractère | Erreur 400 | Auto |
| 18 | Page hors ligne | Version de production, visiter `/`, `/movies`, `/movies/2`, puis couper le serveur | Pages visitées affichées depuis le cache ; page non visitée ou privée → « Vous êtes hors ligne » ; clic sur un lien hors ligne → idem | Script Edge |
| 18b | Bandeau hors ligne | Couper le réseau du navigateur | Bandeau orange, disparaît au retour du réseau | Script Edge |
| 19 | Manifeste PWA valide | `/manifest.webmanifest` | name, display standalone, icônes 192 et 512 ; aucune erreur d'installabilité signalée par le navigateur | Auto + Script Edge |
| 20 | Interface mobile | Largeur 375 px | Menu ☰ qui s'ouvre, grille 2 colonnes, pas de défilement horizontal | Manuel |
| 21 | Déconnexion | Bouton « Déconnexion » | Session supprimée : l'ancien cookie renvoie 401 | Auto |
| 22 | Routes protégées | Visiteur sur `/library` | Redirection vers `/login?next=/library` | Auto |

## 4. Remarques

- Les tests automatiques créent des comptes `test-a-...@example.com` / `test-b-...@example.com` qui
  restent dans la base (leurs avis et entrées sont supprimés à la fin).
- Le service worker n'est actif qu'avec `npm run build` + `npm run start` (pas en `npm run dev`).
- Pour tester le hors ligne à la main : Chrome/Edge → Outils de développement → onglet *Application*
  → *Service workers* (vérifier qu'il est activé) → onglet *Network* → cocher *Offline*.
