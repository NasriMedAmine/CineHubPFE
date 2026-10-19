# Guide de déploiement HTTPS — CineHub

Aucune plateforme d'hébergement ni nom de domaine n'a été fixé pour ce projet. Ce guide explique les
étapes génériques pour déployer CineHub sur un serveur (machine virtuelle, VPS, serveur de l'école…).
Les noms entre `< >` sont à remplacer.

## 1. Prérequis

- Un serveur Linux avec **Node.js 20+** et npm.
- Un **disque persistant** : la base SQLite est un fichier, elle doit survivre aux redémarrages et
  aux mises à jour. Les plateformes « serverless » dont le disque est effacé à chaque déploiement ne
  conviennent pas à SQLite (il faudrait alors passer à PostgreSQL).
- Un **nom de domaine** pointant vers le serveur (nécessaire pour obtenir un certificat HTTPS).

## 2. Variables d'environnement

| Variable | Fichier | Exemple | Rôle |
|---|---|---|---|
| `DATABASE_URL` | `.env` | `file:./prod.db` | chemin de la base SQLite (relatif au dossier `prisma/`) |
| `ANTHROPIC_API_KEY` | `.env.local` | *(secret)* | clé de l'assistant IA (optionnelle) |
| `AI_MODEL` | `.env.local` | `claude-opus-5-5` | modèle utilisé (optionnel) |

Ces fichiers ne doivent **jamais** être envoyés sur Git (ils sont dans `.gitignore`).

## 3. Construction et démarrage

```bash
# Récupérer le code puis, dans le dossier du projet :
npm ci                          # installe exactement les versions du package-lock.json
npx prisma migrate deploy       # crée / met à jour la base (sans poser de questions)
npx prisma db seed              # ajoute les films de démonstration si le catalogue est vide
npm run build                   # construit la version optimisée
npm run start                   # démarre le serveur sur le port 3000
```

En production, `NODE_ENV=production` est défini automatiquement par `next start`, ce qui active :
- le service worker (PWA) ;
- l'option `Secure` du cookie de session (envoyé uniquement en HTTPS).

Pour que l'application redémarre automatiquement (après un plantage ou un redémarrage du serveur),
utiliser un gestionnaire de processus, par exemple un service **systemd** :

```ini
# /etc/systemd/system/cinehub.service
[Unit]
Description=CineHub
After=network.target

[Service]
WorkingDirectory=/home/<utilisateur>/cinehub
ExecStart=/usr/bin/npm run start
Restart=always
User=<utilisateur>

[Install]
WantedBy=multi-user.target
```

## 4. Mise en place de HTTPS

Next.js écoute en HTTP sur le port 3000. On place devant un **reverse proxy** qui gère le
certificat TLS et redirige le HTTP vers le HTTPS.

**Exemple avec Caddy** (certificat Let's Encrypt automatique) :

```
<votre-domaine> {
    reverse_proxy localhost:3000
}
```

**Exemple avec Nginx** (certificat obtenu avec `certbot --nginx`) :

```nginx
server {
    listen 80;
    server_name <votre-domaine>;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name <votre-domaine>;

    ssl_certificate     /etc/letsencrypt/live/<votre-domaine>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<votre-domaine>/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Le port 3000 ne doit pas être ouvert directement sur internet : seul le proxy (80/443) est public.

## 5. Persistance et sauvegarde de la base

- Le fichier SQLite se trouve dans `prisma/` (ex. `prisma/prod.db`). Il doit être sur le disque persistant.
- Sauvegarde simple : copier ce fichier régulièrement (application arrêtée, ou avec `sqlite3 prod.db ".backup sauvegarde.db"`).
- Lors d'une mise à jour du code : `git pull`, `npm ci`, `npx prisma migrate deploy`, `npm run build`,
  puis redémarrer le service. Les données sont conservées.

## 6. Vérifier la PWA en production

1. Ouvrir `https://<votre-domaine>` dans Chrome ou Edge.
2. Outils de développement → *Application* → *Manifest* : pas d'erreur ; *Service workers* : « activated ».
3. L'icône d'installation apparaît dans la barre d'adresse (ou le bouton « ⬇ Installer » dans le menu).
4. Sur Android (Chrome) : menu → « Installer l'application ». Sur iPhone (Safari) : Partager → « Sur l'écran d'accueil ».
5. Tester le hors ligne : onglet *Network* → *Offline*, puis recharger une page déjà visitée.

## 7. Liste de contrôle

- [ ] Node.js 20+ installé
- [ ] `.env` et `.env.local` créés sur le serveur (pas dans Git)
- [ ] `npx prisma migrate deploy` exécuté
- [ ] `npm run build` réussi
- [ ] Service de démarrage automatique configuré
- [ ] Reverse proxy + certificat HTTPS valides, HTTP redirigé vers HTTPS
- [ ] Sauvegarde du fichier SQLite prévue
- [ ] Manifeste et service worker vérifiés dans le navigateur
