# EL BENNA LAB OS — V1

Système de gestion intégré pour le Labo Photo Numérique EL BENNA (Djerba, Tunisie).

Remplace le workflow papier (pochettes manuscrites) par une plateforme web moderne, multi-poste, multi-utilisateur, avec **kanban temps réel**, **carnet d'équipe structuré**, et **page de suivi publique** pour le client.

## Architecture

```
elbenna-lab-os/
├── api/          # Fastify + Prisma + SQLite + Socket.io  (port 8787)
│   ├── src/
│   │   ├── index.ts             # entrypoint
│   │   ├── db.ts                # PrismaClient singleton
│   │   ├── auth.ts              # JWT + role helpers
│   │   ├── audit.ts             # AuditLog helper
│   │   ├── io.ts                # Socket.io server
│   │   └── routes/
│   │       ├── auth.ts          # PIN login, setup, lockout
│   │       ├── me.ts            # Current user + inbox count
│   │       ├── users.ts         # List + admin team management
│   │       ├── customers.ts     # CRM léger
│   │       ├── orders.ts        # Création, statut, paiements, dashboard, caisse
│   │       ├── posts.ts         # Le Carnet (mur, inbox, threads, réactions)
│   │       ├── absences.ts      # Absences + auto post Carnet
│   │       ├── catalog.ts       # Services + catalogue + boutiques
│   │       ├── track.ts         # Page publique (no auth) + QR PNG
│   │       ├── vision.ts        # Stub IA (placeholder pour GLM-OCR/Gemini/OpenAI)
│   │       └── uploads.ts       # Pièces jointes commande
│   ├── prisma/
│   │   ├── schema.prisma        # Schéma complet (~25 tables)
│   │   ├── seed-real.ts         # Comptes réels + données de référence (npm run db:init)
│   │   └── seed-demo.ts         # Fausses commandes de démonstration (efface tout)
│   └── data/
│       ├── dev.db               # SQLite (auto-créé)
│       └── uploads/             # Fichiers uploadés
└── web/          # Vite + React 18 + TS strict + Tailwind + dnd-kit  (port 5173)
    └── src/
        ├── main.tsx              # Routes
        ├── components/
        │   ├── Atoms.tsx         # Logo, Avatar, Badge, StatusPill, UrgencyDot, Card, Button…
        │   └── Shell.tsx         # Sidebar + TopBar (responsive)
        ├── lib/
        │   ├── tokens.ts         # Design tokens extraits de screens.jsx
        │   ├── api.ts            # axios + JWT interceptor
        │   └── socket.ts         # Socket.io client
        ├── store/auth.ts         # Zustand auth state (persisté localStorage)
        └── routes/               # 1 fichier par écran
            ├── Login.tsx
            ├── Dashboard.tsx
            ├── Orders.tsx        # Liste + filtres
            ├── OrderDetail.tsx   # Onglets Infos / Paiements / Pièces jointes / Historique / Carnet
            ├── OrderNew.tsx      # Formulaire création (avec bouton scan IA stub)
            ├── Kanban.tsx        # Drag-and-drop entre colonnes
            ├── Carnet.tsx        # Layout + Mur + Pour Moi + Composer + Post Detail
            ├── Customers.tsx     # CRM
            ├── Cash.tsx          # Caisse du jour
            ├── Team.tsx          # Gestion équipe (admin)
            ├── Scan.tsx          # Scan pochette (UI prête, IA stub)
            └── Track.tsx         # Page publique sans login
```

## Démarrage (développement)

Pré-requis : Node 18+ et npm (SQLite, pas de Docker).

```bash
./start.sh          # installe, crée la base + comptes, lance API (8787) et site (5173)
```

Puis <http://localhost:5173>. Données de démonstration (fausses commandes) : `cd api && npm run db:seed-demo` (⚠ efface tout).

## Comptes

| Profil | Rôle | Accès |
|---|---|---|
| Seif · Ghaith · Imed · Mounira | Admin | Tout, + page **Caisse & CA** (re-demande le code) + Équipe |
| Najet | Responsable | Tout le travail courant, supprimer une commande — pas la caisse ni l'équipe |
| Invité 1 · Invité 2 | Production | Commandes, Kanban, Carnet, scan — pas la caisse |

Code par défaut **0000** pour tous. À la connexion, chacun peut choisir son code personnel
(admin : 6 chiffres, autres : 4) ; l'invitation revient tant que ce n'est pas fait.
Un admin peut réinitialiser / fixer un code dans **Équipe**. Les codes sont stockés hachés (bcrypt) : personne ne peut les lire.
Remettre 0000 à tous : `cd api && RESET_PINS=1 npm run db:seed-real`.

## Déploiement (production)

Un seul processus : l'API sert aussi le site compilé (`web/dist`).

```bash
./start-prod.sh     # 1re fois : crée api/.env (secret aléatoire), installe, compile, crée base + comptes, démarre
```

1. Dans `api/.env` : `FRONTEND_ORIGIN` / `PUBLIC_BASE_URL` = adresse publique du site (sert au QR de suivi client),
   et la clé du scan IA (`OPENROUTER_API_KEY`…). Modèle : `api/.env.example`.
2. L'API **refuse de démarrer** en production avec un `JWT_SECRET` faible ou de développement.
3. Mets le site derrière HTTPS (reverse proxy Caddy / nginx → port 8787, WebSocket `/socket.io` inclus).
4. Garde le processus vivant : `pm2 start "npm run start:prod" --name elbenna --cwd api` (ou systemd).
5. **Avant l'ouverture : chaque admin change son code 0000.**
6. Sauvegardes : copie `api/prisma/data/prod.db` et `api/data/uploads/` (ex. `cp api/prisma/data/prod.db backups/prod-$(date +%F).db`).

Tout l'API est sous `/api/*` ; `/uploads/*` = pièces jointes ; les autres adresses sont les pages du site.


### Variante : site sur Vercel + API sur un petit hébergeur

Vercel ne fait tourner que le site (pas de disque persistant ni de WebSocket) : l'API (SQLite, photos, temps réel)
doit tourner ailleurs avec le `Dockerfile` (Railway, Fly.io, VPS…).

**1. API** (Railway/Fly/VPS, volume sur `/data`, une seule instance) — variables :
`JWT_SECRET` (32+ car. aléatoires), `FRONTEND_ORIGIN=https://ton-site.vercel.app` (plusieurs adresses possibles, séparées par des virgules),
`PUBLIC_BASE_URL=https://ton-site.vercel.app`, `OPENROUTER_API_KEY`. Note l'adresse publique de l'API (ex. `https://elbenna-api.up.railway.app`).

**2. Vercel** — projet importé depuis le dépôt. Le `vercel.json` de la racine déclare **uniquement** le site (`web`) : l'API n'est volontairement PAS déployée sur Vercel
(SQLite, photos et WebSocket n'y fonctionnent pas). Si Vercel propose d'ajouter un service « api », refuse. Alternative sans ce fichier : *Settings → General* :
- **Root Directory : `web`**
- Framework Preset : Vite (détecté via `web/vercel.json`)
- *Environment Variables* : `VITE_API_URL=https://elbenna-api.up.railway.app` (adresse de l'API, sans `/` final)
- puis **Redeploy** : la variable n'est lue qu'à la compilation.

Seule l'adresse inscrite dans `FRONTEND_ORIGIN` peut parler à l'API (les URL d'aperçu Vercel `*-git-*.vercel.app` sont refusées tant qu'on ne les ajoute pas).

## Features livrées V1

| Feature | Statut | Détails |
|---|---|---|
| Auth PIN (admin 6 / membres 4) | ✅ | bcrypt, lockout 5 essais, JWT 12h, switch user, onboarding 1ère connexion |
| Création commande | ✅ | Code auto `LB-YYYYMM-XXXX`, services multi-select, lignes, urgence, livraison |
| Détail commande | ✅ | 5 onglets : Infos / Paiements / Pièces jointes / Historique / Carnet |
| Multi-paiements | ✅ | Espèces / Carte / Virement / Chèque / D17 / Edinar — auto-update statut paiement |
| Kanban temps réel | ✅ | Drag-and-drop @dnd-kit + Socket.io broadcast à tous les postes |
| Liste commandes | ✅ | Filtres rapides + recherche fuzzy (ticket, client, GSM, pochette) |
| Dashboard | ✅ | 6 cartes KPI + activité + répartition par statut |
| Le Carnet (Addendum #1) | ✅ | 8 types imposés, scopes (DIRECT/ROLE/SHOP/ALL), threads, accusés, réactions, mentions, absences |
| Pour Moi (inbox) | ✅ | Onglets À traiter / À suivre / Archive |
| Composer post | ✅ | UX 2 étapes : choix du type → formulaire spécifique |
| Page tracking publique | ✅ | `/track/:ticketCode` sans login + QR PNG `/api/track/:code/qr.png` |
| Caisse | ✅ | Total jour + breakdown par mode + liste encaissements |
| Clients (CRM) | ✅ | Liste + recherche + fiche avec historique |
| Audit log | ✅ | Toutes actions critiques tracées |
| Gestion équipe | ✅ | Admin : ajout, désactivation, **modifier PIN**, réinitialiser PIN, activer/désactiver |
| **Mon profil** | ✅ | Chaque membre peut **changer son PIN** lui-même + voir l'état session |
| Session 30 jours | ✅ | JWT longue durée — **pas de re-login pendant la journée**. Localstorage persisté. |
| Pièces jointes | ✅ | Upload, thumbnails servis statiquement |
| Socket.io | ✅ | Events : `order.created`, `order.updated`, `order.status_changed`, `post.created`, `post.resolved`, … |
| **Responsive PC / tablette / mobile** | ✅ | Sidebar collapse < 900px (icônes seules), TopBar adaptatif, login keypad full-screen mobile |
| Design fidèle | ✅ | Tokens extraits de `screens.jsx` (COLORS, FONT) — composants Logo, StatusPill, UrgencyDot, etc. |
| Format Tunisien | ✅ | Téléphones `+216 28 555 123`, devise TND avec millimes, dates dd/MM/yyyy |

## Reportés V2 (documentés)

- **Vision IA pochette** : adapter pattern en place (`api/src/routes/vision.ts`) ; retourne actuellement des données factices pour démo. Brancher GLM-OCR / Gemini Flash / OpenAI nécessite uniquement une clé API et un prompt système (cf. PROMPT_ULTIME §API Vision).
- **WhatsApp / SMS réels** : adapter pattern à ajouter (Twilio + Meta WhatsApp Business Cloud). En V1, les notifications sont en log-only.
- **PWA offline-first complète** (Service Worker + Background Sync) : nécessite une session dédiée.
- **AR / RTL** (i18next) : structure prête (composants utilisent les tokens), nécessite traductions.
- **Studio booking, Stock & inventaire, Statistiques avancées** : non commencés.
- **Playwright E2E** : tests API smoke faits, Playwright à ajouter.
- **Docker prod + TLS local + sauvegardes** : pour passage en production réelle au labo.

## Endpoints API (résumé)

```
# Auth (public)
GET    /auth/users               Liste profils pour le picker
POST   /auth/login               { userId, pin }
POST   /auth/setup-pin           1ère connexion : { userId, pin }

# Authentifié (Bearer JWT)
GET    /me                       Profil courant + boutique
POST   /me/change-pin            Changer son propre PIN { currentPin, newPin }
GET    /me/inbox-count           Compteur Pour Moi

GET    /users                    Liste membres
GET    /admin/users              Détail (admin)
POST   /admin/users              Créer membre
POST   /admin/users/:id/set-pin  Admin définit/modifie le PIN d'un membre
POST   /admin/users/:id/reset-pin Admin force le re-choix du PIN à la prochaine connexion
POST   /admin/users/:id/toggle   Activer/désactiver un compte

GET    /customers?q=             Recherche
GET    /customers/:id            Fiche + historique
POST   /customers/lookup-or-create
POST   /customers

GET    /orders?status=&q=&mine=  Liste
GET    /orders/:id               Détail complet (relations)
POST   /orders                   Créer (auto ticketCode)
PATCH  /orders/:id
POST   /orders/:id/status        Changer statut → broadcast Socket.io
POST   /orders/:id/payments      Encaisser → maj paymentStatus auto
POST   /orders/:id/attachments   multipart/form-data

GET    /dashboard                Counters + breakdown
GET    /cash/today               Caisse du jour

GET    /posts/feed               Mur (filtré visibilité)
GET    /posts/inbox              Pour Moi
GET    /posts/:id                Détail + replies + receipts + reactions
POST   /posts                    Créer (DIRECT / ALL / ROLE / SHOP)
POST   /posts/:id/resolve
POST   /posts/:id/replies
POST   /posts/:id/react          { emoji }

GET    /absences
POST   /absences                 Crée auto un post ABSENCE_NOTE épinglé
POST   /absences/:id/approve

GET    /services
GET    /catalog
GET    /shops

POST   /vision/extract-pouch     Stub IA

# Public (no auth)
GET    /track/:ticketCode        Données minimales du suivi
GET    /track/:ticketCode/qr.png QR PNG
```

## Tests effectués

Smoke E2E API (script reproductible — voir CHANGELOG) :
- ✅ Login avec PIN 6 chiffres
- ✅ /me retourne le bon utilisateur + boutique
- ✅ Lookup-or-create customer (auto-création)
- ✅ Create order → ticket auto `LB-202605-0006`
- ✅ Status change `RECUE → EN_PRODUCTION` (broadcast Socket.io)
- ✅ Multi-payment : 10 + 40 = 50 → auto status `PAYE`
- ✅ Public tracking sans token (timeline + données restreintes)
- ✅ QR PNG (HTTP 200, 2110 bytes)
- ✅ Carnet post creation + resolution (status `RESOLVED`)
- ✅ Dashboard counters reflètent les changements en temps réel

Vérification visuelle massive dans le navigateur (3 viewports) :

**Desktop 1280×720** : Login picker, login keypad, Dashboard, Kanban, Orders list, Order detail (Infos + Paiements + Carnet tabs), Order new, Profile, Team (avec modal "Définir un PIN"), Scan, Carnet wall, Pour Moi, Composer (étape 1 + étape 2), Customers, Cash, Public tracking — **tous OK**.

**Tablette 1024×768** : Dashboard 3 colonnes, Orders avec scroll horizontal, Kanban — sidebar et layout adaptés.

**Mobile 390×844** : Sidebar collapse en icônes seules, TopBar avec titre tronqué propre + bouton "+" compact, Login keypad full-screen avec branding header compact, Login picker en 2 colonnes, cards stack vertical.

**Synchronisation Socket.io vérifiée** :
- Sonia (session A) crée la commande `LB-202605-0007 Sync Test` via API
- Adel (session B) sur Kanban voit la nouvelle carte apparaître **automatiquement** (compteur passé de 1 à 2 sur "Reçue", sidebar Commandes 5 → 6)
- Sonia change ensuite le statut → `EN_PRODUCTION` → la carte se déplace **automatiquement** dans la colonne Production sur l'écran d'Adel sans reload

**Tests PIN** :
- ✅ Sonia change son propre PIN `1234 → 9876` → login avec 9876 OK
- ✅ Adel (admin) définit nouveau PIN pour Sonia `9876 → 1234` → login OK
- ✅ Tentative `change-pin` avec mauvais PIN actuel → rejeté `bad_current_pin`
- ✅ JWT validité = 30 jours (pas de re-login dans la journée)

## Variables d'environnement

`api/.env` :
```
DATABASE_URL="file:./data/dev.db"
JWT_SECRET="<32+ caractères aléatoires : openssl rand -hex 32>"
PORT=8787
FRONTEND_ORIGIN="http://localhost:5173"
PUBLIC_BASE_URL="http://localhost:5173"
```

## Migration vers PostgreSQL

Le schéma Prisma est compatible PostgreSQL (zéro type spécifique SQLite). Pour passer à Postgres / Supabase :
1. `provider = "postgresql"` dans `schema.prisma`
2. `DATABASE_URL` pointant vers Postgres
3. `npx prisma migrate dev --name init`

## Décisions de conception

- **SQLite en V1** : zéro friction d'installation pour tester. Schéma compatible pour migrer en PostgreSQL avant prod.
- **Pas de monorepo pnpm** : npm fonctionne, deux projets indépendants (api/ et web/) — moins de magie, plus simple à déployer.
- **TypeScript strict** : zéro `any`, validation Zod sur toutes les entrées API.
- **Tokens design fidèles** : `web/src/lib/tokens.ts` réplique `COLORS` de `screens.jsx`.
- **Socket.io vs SSE** : Socket.io pour rétro-compat + reconnexion automatique.
- **Adapter pattern Vision** : prêt à brancher GLM-OCR / Gemini / OpenAI sans toucher au code appelant.
- **Soft-delete commandes** : `deletedAt` au lieu de DELETE physique.
- **Permissions** : par middleware `requireAuth` + `requireRole('ADMIN')`.

---

**Build par Claude Sonnet · session du 2026-05-10. Spec source : PROMPT_ULTIME_EL_BENNA.md + ADDENDUM_1_CARNET_EQUIPE.md.**
