# Architecture Technique — ERP Intelligent Notification & Alert Management System


## 1. Stack Technologique

| Couche | Technologie | Version | Justification |
|--------|-------------|---------|---------------|
| **Serveur** | Node.js | 18+ | Runtime JavaScript côté serveur, performant et événementiel |
| **Framework API** | Express.js | 4.x | Framework minimaliste, grande flexibilité, large écosystème |
| **Base de données** | MongoDB | 6+ | Base NoSQL orientée documents, schéma flexible adapté aux données hétérogènes des modules ERP |
| **ODM** | Mongoose | 7+ | Modélisation de données, validation de schéma, middleware hooks |
| **Frontend** | React.js | 18+ | Bibliothèque UI déclarative, composants réutilisables, écosystème mature |
| **UI Kit** | Material-UI (MUI) | 5.x | Composants prêts à l'emploi respectant Material Design, responsive par défaut |
| **Authentification** | JWT (jsonwebtoken) | — | Standard ouvert (RFC 7519), authentification stateless adaptée aux API REST |
| **Hachage** | bcryptjs | — | Hachage de mots de passe avec salt, résistant aux attaques par force brute |
| **Client HTTP** | Axios | 1.x | Intercepteurs de requêtes, gestion automatique des headers (JWT) |
| **Routage frontend** | React Router DOM | 6.x | Navigation SPA sans rechargement de page |

---

## 2. Architecture Applicative

### 2.1 — Vue d'ensemble

```
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│                     │  HTTP    │                     │ Mongoose │                     │
│   Frontend React    │ ◄──────► │   Backend Express   │ ◄──────► │      MongoDB        │
│   (Port 3000)       │  REST   │   (Port 5000)       │          │   (Port 27017)      │
│                     │  JSON   │                     │          │                     │
└─────────────────────┘         └─────────────────────┘          └─────────────────────┘
       │                               │
       │ localStorage                  │ .env
       │ (token JWT)                   │ (JWT_SECRET, MONGODB_URI)
```

### 2.2 — Pattern Architectural : MVC (Model-View-Controller)

Le backend suit le pattern **MVC** pour séparer les responsabilités :

| Couche | Dossier | Rôle |
|--------|---------|------|
| **Model** | `backend/src/models/` | Définition des schémas Mongoose (structure des données) |
| **Controller** | `backend/src/controllers/` | Logique métier (traitement des requêtes) |
| **Route** | `backend/src/routes/` | Routage HTTP → associe chaque URL à un controller |
| **Middleware** | `backend/src/middlewares/` | Fonctions intermédiaires (vérification JWT, CORS…) |
| **Config** | `backend/src/config/` | Configuration (connexion à la BDD) |

### 2.3 — Flux d'une requête typique

```
[Client React]
     │
     ▼
 1. Axios envoie POST /api/auth/login
     │  
     ▼
 2. Express reçoit la requête
     │
     ▼
 3. Route /api/auth/* → authRoutes.js
     │
     ▼
 4. Middleware (si route protégée) → authMiddleware.js
     │  vérifie le JWT, extrait { id, role }
     ▼
 5. Controller → authController.js
     │  exécute la logique métier
     ▼
 6. Model → User.js
     │  interagit avec MongoDB via Mongoose
     ▼
 7. Réponse JSON renvoyée au client
```

---

## 3. Arborescence du Projet

```
erp-notification-system--master/
│
├── backend/                            ← Serveur API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                   ← Connexion MongoDB
│   │   ├── models/
│   │   │   ├── User.js                 ← Modèle utilisateur
│   │   │   └── AlertRule.js            ← Modèle règle d'alerte
│   │   ├── routes/
│   │   │   ├── authRoutes.js           ← Routes d'authentification
│   │   │   └── alertRoutes.js          ← Routes des alertes
│   │   ├── controllers/
│   │   │   ├── authController.js       ← Logique auth (register, login, getMe)
│   │   │   └── alertController.js      ← Logique CRUD alertes
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js       ← Protection JWT des routes
│   │   └── index.js                    ← Point d'entrée du serveur
│   ├── .env                            ← Variables d'environnement
│   ├── package.json
│   └── package-lock.json
│
├── frontend/                           ← Client React
│   ├── public/
│   │   └── index.html                  ← Page HTML racine
│   ├── src/
│   │   ├── App.js                      ← Routage principal
│   │   ├── index.js                    ← Point d'entrée React
│   │   ├── pages/
│   │   │   ├── LoginPage.js            ← Formulaire de connexion
│   │   │   ├── RegisterPage.js         ← Formulaire d'inscription
│   │   │   └── DashboardPage.js        ← Tableau de bord
│   │   ├── components/
│   │   │   ├── Navbar.js               ← Barre de navigation
│   │   │   └── ProtectedRoute.js       ← Garde de route (vérifie le token)
│   │   └── services/
│   │       └── api.js                  ← Instance Axios + intercepteur JWT
│   ├── .env
│   └── package.json
│
├── .gitignore
├── ARCHITECTURE.md                     ← Ce document
└── package.json
```

---

## 4. Schéma de la Base de Données

La base de données MongoDB contient actuellement **2 collections** :

### 4.1 — Collection `users`

Stocke les comptes utilisateurs du système.

| Champ | Type | Requis | Unique | Défaut | Description |
|-------|------|--------|--------|--------|-------------|
| `_id` | `ObjectId` | Auto | ✅ | Auto-généré | Identifiant unique MongoDB |
| `name` | `String` | ✅ | — | — | Nom complet de l'utilisateur |
| `email` | `String` | ✅ | ✅ | — | Adresse email (sert d'identifiant de connexion) |
| `passwordHash` | `String` | ✅ | — | — | Mot de passe haché avec bcrypt (10 salt rounds) |
| `role` | `String` | — | — | `"user"` | Rôle de l'utilisateur : `"admin"` ou `"user"` |
| `createdAt` | `Date` | — | — | `Date.now` | Date de création du compte |

**Index :** `email` (unique) — empêche les doublons et optimise les recherches par email.

### 4.2 — Collection `alertrules`

Stocke les règles d'alerte configurées par les utilisateurs.

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `_id` | `ObjectId` | Auto | Identifiant unique MongoDB |
| `user` | `ObjectId` (→ `users`) | ✅ | Référence vers l'utilisateur créateur |
| `name` | `String` | ✅ | Nom de la règle d'alerte |
| `condition` | `Object` | ✅ | Objet décrivant les conditions de déclenchement |
| `isActive` | `Boolean` | — | Indique si la règle est active (`true` par défaut) |
| `createdAt` | `Date` | — | Date de création |

### 4.3 — Diagramme des relations

```
┌──────────────────────────┐
│         users            │
├──────────────────────────┤        ┌──────────────────────────┐
│ _id         : ObjectId   │◄───────│       alertrules         │
│ name        : String     │        ├──────────────────────────┤
│ email       : String     │        │ _id       : ObjectId     │
│ passwordHash: String     │        │ user      : ObjectId ──► │
│ role        : String     │        │ name      : String       │
│ createdAt   : Date       │        │ condition : Object       │
└──────────────────────────┘        │ isActive  : Boolean      │
                                    │ createdAt : Date         │
                                    └──────────────────────────┘

Relation : Un utilisateur (User) peut avoir plusieurs règles d'alerte (AlertRule).
           → Relation 1:N via le champ `user` (référence ObjectId).
```

---

## 5. Endpoints de l'API REST

### 5.1 — Authentification (`/api/auth`)

| Méthode | Route | Description | Auth | Body (entrée) | Réponse (succès) |
|---------|-------|-------------|------|----------------|------------------|
| `POST` | `/api/auth/register` | Créer un compte | ❌ | `{ name, email, password }` | `201` — `{ _id, name, email, role, token }` |
| `POST` | `/api/auth/login` | Se connecter | ❌ | `{ email, password }` | `200` — `{ _id, name, email, role, token }` |
| `GET` | `/api/auth/me` | Profil utilisateur | ✅ JWT | — | `200` — `{ _id, name, email, role }` |

### 5.2 — Gestion des alertes (`/api/alerts`)

| Méthode | Route | Description | Auth | Body (entrée) | Réponse (succès) |
|---------|-------|-------------|------|----------------|------------------|
| `GET` | `/api/alerts` | Lister les alertes de l'utilisateur | ✅ JWT | — | `200` — `[{ alertRule }, ...]` |
| `POST` | `/api/alerts` | Créer une nouvelle alerte | ✅ JWT | `{ name, condition }` | `201` — `{ alertRule }` |
| `PUT` | `/api/alerts/:id` | Modifier une alerte | ✅ JWT | `{ name?, condition?, isActive? }` | `200` — `{ alertRule }` |
| `DELETE` | `/api/alerts/:id` | Supprimer une alerte | ✅ JWT | — | `200` — `{ message }` |

### 5.3 — Format d'authentification

Toutes les routes protégées (✅ JWT) requièrent le header suivant :

```
Authorization: Bearer <token_jwt>
```

Le token est obtenu lors du `register` ou `login` et doit être inclus dans chaque requête vers une route protégée.

---

## 6. Sécurité

### 6.1 — Hachage des mots de passe

- **Algorithme :** bcrypt via la bibliothèque `bcryptjs`
- **Salt rounds :** 10 (compromis entre sécurité et performance)
- **Principe :** Le mot de passe n'est **jamais** stocké en clair. Seul le hash est enregistré en base.
- **Vérification :** `bcrypt.compare()` re-hache le mot de passe fourni avec le même salt et compare les résultats.

### 6.2 — JSON Web Tokens (JWT)

- **Algorithme de signature :** HS256 (HMAC-SHA256)
- **Clé secrète :** Stockée dans `.env` (`JWT_SECRET`), jamais exposée côté client
- **Expiration :** 7 jours (`expiresIn: '7d'`)
- **Contenu du payload :** `{ id: ObjectId, role: String, iat: timestamp, exp: timestamp }`
- **Stockage côté client :** `localStorage`

### 6.3 — Protection des routes

- **Backend :** Le middleware `protect` dans `authMiddleware.js` intercepte les requêtes, extrait le token du header `Authorization`, le vérifie avec `jwt.verify()`, et attache `req.user` à la requête.
- **Frontend :** Le composant `ProtectedRoute` vérifie la présence du token dans `localStorage`. Sans token → redirection vers `/login`.

### 6.4 — Bonnes pratiques appliquées

| Pratique | Mise en œuvre |
|----------|---------------|
| Messages d'erreur génériques | Le login renvoie `"Invalid credentials"` que l'email ou le mot de passe soit incorrect |
| Variables sensibles dans `.env` | `JWT_SECRET` et `MONGODB_URI` ne sont jamais dans le code source |
| `.gitignore` | Les fichiers `.env` et `node_modules/` sont exclus du dépôt Git |
| Validation côté client ET serveur | Le frontend valide (longueur mdp, confirmation), le backend re-valide (email unique, champs requis) |

---

## 7. Variables d'Environnement

### Backend (`backend/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGODB_URI` | URI de connexion à MongoDB | `mongodb://localhost:27017/erp-notif` |
| `PORT` | Port d'écoute du serveur Express | `5000` |
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT | `chaîne_aléatoire_longue_et_complexe` |

### Frontend (`frontend/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `REACT_APP_API_URL` | URL de base de l'API backend | `http://localhost:5000/api` |



