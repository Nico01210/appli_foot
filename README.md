# PronoFoot - Pronostics Football ⚽

Application web de pronostics football entre amis pour la **Coupe du Monde 2026**. Chaque joueur prédit les scores des matchs et marque des points selon la justesse de ses pronostics. Accessible sur mobile et ordinateur depuis n'importe où.

## Fonctionnalités

### Pronostics
- **Prédiction de score** sur chaque match à venir
- **Choix du vainqueur en phase finale** : quand un joueur prédit un score nul sur un match de phase finale (knockout), il doit choisir quelle équipe sera le vainqueur
- **Verrouillage automatique** : impossible de pronostiquer une fois le match commencé
- **Modification** possible tant que le match n'a pas débuté
- **Compte à rebours** en temps réel sur chaque match

### Système de points
| Résultat | Points |
|---|---|
| Score exact | **3 points** |
| Bon vainqueur (ou match nul) | **1 point** |
| Mauvais pronostic | **0 point** |
| Bonus : bon vainqueur choisi en phase finale (score nul prédit) | **+1 point** |

Les points sont configurables par l'admin via l'interface.

### Classement
- Classement général en temps réel
- **Flèches de progression** (vert/rouge) indiquant l'évolution du rang après chaque match
- Statistiques par joueur : nombre de pronostics, taux de réussite
- Podium avec médailles (or, argent, bronze)
- Clic sur un joueur pour voir **tous ses pronostics** (en cours et terminés)

### Vie privée des pronostics
- Les pronostics des autres joueurs sont **masqués** tant que le match n'a pas commencé
- Visibles une fois le match démarré ou terminé

### Administration (réservé aux admins)
- Onglet Admin **invisible** pour les joueurs non-admin
- Ajout de matchs avec sélection de phase (groupes / phase finale)
- Mise à jour des scores et résultats
- Modification des pseudos des joueurs (les joueurs ne peuvent pas changer leur pseudo eux-mêmes)
- Protection contre les doublons de pseudos
- Configuration du barème de points
- Statistiques globales

### Expérience utilisateur
- **PWA** : installable sur mobile comme une app native
- **Responsive** : adapté mobile, tablette et desktop
- **Thème sombre/clair** avec détection automatique des préférences système
- **Drapeaux emoji** pour 50+ équipes nationales

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | HTML5, CSS3 (variables CSS, Grid, Flexbox), JavaScript vanilla (ES6+) |
| Backend | Node.js, Express |
| Base de données | SQLite3 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Sécurité | Helmet, express-rate-limit, CORS |
| PWA | Service Worker, Web App Manifest |
| Hébergement | Render.com (avec disque persistant) |

## Structure du projet

```
appli_foot/
├── index.html              # Page unique (SPA)
├── app.js                  # Logique UI (classe UIManager)
├── api-client.js           # Client API (classe APIClient)
├── styles.css              # Styles responsive + thèmes
├── manifest.json           # Configuration PWA
├── sw.js                   # Service Worker
├── render.yaml             # Config déploiement Render.com
├── .gitignore
└── backend/
    ├── server.js           # Serveur Express
    ├── package.json
    ├── models/
    │   ├── database.js     # Connexion SQLite + schéma
    │   ├── User.js         # Modèle utilisateur
    │   ├── Match.js        # Modèle match
    │   └── Prediction.js   # Modèle pronostic + calcul des points
    ├── routes/
    │   ├── auth.js         # Inscription, connexion, JWT
    │   ├── users.js        # Gestion des joueurs
    │   ├── matches.js      # CRUD matchs + mise à jour scores
    │   ├── predictions.js  # CRUD pronostics
    │   └── leaderboard.js  # Classement + historique des rangs
    └── scripts/
        └── migrate.js      # Scripts de migration
```

## Base de données

| Table | Rôle |
|---|---|
| `users` | Joueurs (pseudo unique, email, hash mot de passe, points, stats) |
| `matches` | Matchs (équipes, date, tournoi, phase group/knockout, score, statut) |
| `predictions` | Pronostics (score prédit, winner_pick pour knockout, points gagnés) |
| `points_config` | Barème de points configurable |
| `rank_history` | Historique des classements pour les flèches de progression |

## API

### Authentification (`/api/auth`)
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Non | Inscription (pseudo, email, mot de passe) |
| POST | `/login` | Non | Connexion → retourne un JWT (7 jours) |
| GET | `/me` | Oui | Infos de l'utilisateur connecté |

### Matchs (`/api/matches`)
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Non | Liste des matchs (filtre par `?status=` ou `?userId=`) |
| POST | `/` | Admin | Créer un match |
| PUT | `/:id/score` | Admin | Mettre à jour le score → calcule les points |
| PUT | `/:id/status` | Admin | Changer le statut |
| DELETE | `/:id` | Admin | Supprimer un match |

### Pronostics (`/api/predictions`)
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/user/:userId` | Non | Pronostics d'un joueur |
| GET | `/match/:matchId` | Non | Pronostics d'un match |
| POST | `/` | Oui | Créer/modifier un pronostic |

### Classement (`/api/leaderboard`)
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Non | Classement général avec évolution |
| GET | `/detailed` | Non | Classement détaillé |
| GET | `/user/:userId` | Non | Rang d'un joueur |

## Installation locale

```bash
# Cloner le projet
git clone <url-du-repo>
cd appli_foot

# Installer les dépendances
cd backend
npm install

# Lancer le serveur
node server.js
```

L'application est accessible sur `http://localhost:3001`.

## Déploiement (Render.com)

1. **Pousser sur GitHub** :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <url-github>
   git push -u origin main
   ```

2. **Sur Render.com** :
   - Créer un **Web Service** connecté au dépôt GitHub
   - Root Directory : `backend`
   - Build Command : `npm install`
   - Start Command : `node server.js`
   - Variables d'environnement :
     - `JWT_SECRET` : chaîne secrète aléatoire
     - `DB_PATH` : `/opt/render/project/data`
     - `NODE_ENV` : `production`
   - Ajouter un **Disk** (1 GB) monté sur `/opt/render/project/data`

Le fichier [render.yaml](render.yaml) est inclus pour configurer automatiquement le service.

## Licence

MIT