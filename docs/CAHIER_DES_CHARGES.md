# Cahier des charges — CineHub

## 1. Contexte

Dans le cadre du module, il est demandé de réaliser une application web moderne qui mette en œuvre
Next.js, TypeScript, une base de données, une authentification, des opérations CRUD, une PWA avec
mode hors ligne et une intégration d'intelligence artificielle côté serveur.

Le thème choisi est le **cinéma** : CineHub permet de découvrir des films, de les noter et de gérer
sa propre liste de films.

## 2. Objectif de l'application

Offrir aux utilisateurs un espace simple pour :
- consulter un catalogue de films et rechercher un titre ;
- donner leur avis et voir la note moyenne de chaque film ;
- organiser leurs films (à voir, en cours, vus) et leurs favoris ;
- obtenir des idées de films grâce à un assistant IA ;
- utiliser l'application comme une application installée, même avec une connexion instable.

## 3. Acteurs

| Acteur | Description |
|---|---|
| Visiteur | Personne non connectée. Consultation uniquement. |
| Utilisateur connecté | Personne inscrite et connectée. Accès à toutes les fonctionnalités personnelles. |

## 4. Besoins fonctionnels

### Gestion des comptes
| Code | Besoin | Règles |
|---|---|---|
| F01 | Inscription | Nom, email, mot de passe, confirmation. Champs obligatoires, email valide et unique, mot de passe de 8 à 100 caractères, confirmation identique. Message de succès. |
| F02 | Connexion | Email + mot de passe. Message d'erreur identique que l'email ou le mot de passe soit faux. Redirection vers la page demandée. |
| F03 | Déconnexion | Suppression de la session en base et du cookie. Retour à l'accueil. |
| F04 | Profil | Affichage du nom, de l'email et de la date d'inscription. Modification du nom et de l'email. |

### Films
| Code | Besoin | Règles |
|---|---|---|
| F06 | Catalogue | Grille responsive de cartes (affiche, titre, genre, année, note moyenne, bouton Détails). États chargement et vide. |
| F07 | Détail d'un film | Affiche, titre, description, genre, année, réalisateur, durée, note moyenne, avis. Boutons d'action si connecté. |
| F08 | Recherche | Par titre, insensible à la casse. Filtre optionnel par genre. Message si aucun résultat. |

### Données personnelles (CRUD)
| Besoin | Règles |
|---|---|
| Bibliothèque personnelle | Ajouter un film du catalogue avec un statut (à voir / en cours / vu) et une note personnelle ; lister ; modifier ; supprimer. Un film une seule fois par utilisateur. |
| Favoris | Ajouter, lister, retirer. Un film une seule fois par utilisateur. |
| Avis | Note entière de 1 à 5 + commentaire (3 à 1000 caractères). Créer, lire, modifier, supprimer. Un avis par film et par utilisateur. |
| Note moyenne | Calculée à partir des avis enregistrés, jamais saisie à la main. |

### Assistant IA
| Besoin | Règles |
|---|---|
| Recommandations | L'utilisateur connecté décrit ses envies (3 à 500 caractères). Le serveur interroge l'IA avec le catalogue. Chaque recommandation : titre, genre, explication, lien vers la fiche si le film est dans le catalogue. |
| Absence de clé | Message clair + simple filtrage par mots-clés, présenté comme « sans IA ». |

### PWA
| Besoin | Règles |
|---|---|
| Installation | Manifeste complet (nom, icônes 192 et 512, couleurs, `standalone`). Bouton d'installation quand le navigateur le permet. |
| Hors ligne | Pages publiques visitées disponibles hors ligne, page « hors ligne » sinon, bandeau d'information, assistant désactivé, aucune écriture hors ligne. |

## 5. Besoins non fonctionnels

- **Sécurité :** mots de passe hachés (bcrypt), cookie de session `HttpOnly` / `SameSite=Lax` /
  `Secure` en production, vérification des droits côté serveur, clé d'IA uniquement côté serveur.
- **Ergonomie :** interface en français, thème sombre, mobile d'abord.
- **Persistance :** les données restent après un redémarrage (fichier SQLite).
- **Maintenabilité :** code simple, commenté, organisé par fonctionnalité.
- **Déploiement :** application prête à être déployée en HTTPS.

## 6. Contraintes techniques

- Next.js (App Router), React, TypeScript.
- SQLite avec Prisma.
- Pas de microservices ni d'architecture complexe.
- Nombre de dépendances limité.

## 7. Livrables

- Le code source de l'application (`v1/`).
- Le `README.md` et la documentation du dossier `docs/`.
- Des tests automatiques des routes API (`tests/api.test.mjs`).
