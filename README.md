# EL BENNA LAB OS — V1

Système de gestion intégré pour le Labo Photo Numérique EL BENNA (Djerba, Tunisie).

Remplace le workflow papier (pochettes manuscrites) par une plateforme web moderne, multi-poste, multi-utilisateur, avec **kanban temps réel**, **carnet d'équipe structuré**, et **page de suivi publique** pour le client.

## Architecture

```
elbenna-lab-os/
├── server/            # API Fastify + Prisma (PostgreSQL)
│   ├── src/           #   app.ts (routes /api/*) · index.ts (serveur local) · vercel.ts (fonction Vercel)
│   │   ├── routes/    #   auth, orders, posts (Carnet), finance (caisse protégée), vision (scan IA), events…
│   │   ├── storage.ts #   pièces jointes : Supabase Storage (prod) ou disque (dev)
│   │   └── events.ts  #   évènements « temps réel » écrits en base
│   └── prisma/        #   schema.prisma · seed-real.ts (comptes) · seed-demo.ts (fausses commandes)
├── api/index.js       # fonction Vercel = bundle de server/src/vercel.ts (généré par `npm run build:api`, commité)
├── web/               # Site Vite + React 18 + TypeScript + Tailwind
├── vercel.json        # build + routage Vercel
└── package.json       # dépendances du serveur + scripts (dev, build, db:init…)
```

Hébergement 100 % gratuit possible : **Vercel** (site + API en fonction) + **Supabase** (Postgres + Storage).
Le « temps réel » est un rafraîchissement automatique (4 s) : Vercel ne supporte pas les WebSocket.

## Démarrage (développement)

Pré-requis : Node 20+, et une base Postgres (un projet Supabase de test convient — voir ci-dessous).

```bash
cp .env.example .env     # puis renseigne DATABASE_URL, DIRECT_URL, JWT_SECRET (+ clé IA)
./start.sh               # installe, crée tables + comptes, lance API (8787) et site (5173)
```

Puis <http://localhost:5173>. Fausses commandes de démo : `npm run db:seed-demo` (⚠ efface tout).

## Comptes

| Profil | Rôle | Accès |
|---|---|---|
| Seif · Ghaith · Imed · Mounira | Admin | Tout, + page **Caisse & CA** (re-demande le code) + Équipe |
| Najet | Responsable | Tout le travail courant, supprimer une commande — pas la caisse ni l'équipe |
| Invité 1 · Invité 2 | Production | Commandes, Kanban, Carnet, scan — pas la caisse |

Code par défaut **0000** pour tous. À la connexion, chacun peut choisir son code personnel
(admin : 6 chiffres, autres : 4) ; l'invitation revient tant que ce n'est pas fait.
Un admin peut réinitialiser / fixer un code dans **Équipe**. Les codes sont stockés hachés (bcrypt).
Remettre 0000 à tous : `RESET_PINS=1 npm run db:seed-real`.

## Déploiement gratuit : Supabase + Vercel

### 1. Supabase (base + fichiers)
1. supabase.com → *New project* (région Europe, note le mot de passe de la base).
2. *Project Settings → Database → Connection string* :
   - **Transaction pooler** (port 6543) → c'est `DATABASE_URL`, ajoute à la fin `?pgbouncer=true&connection_limit=1`
   - **Session pooler** (port 5432) → c'est `DIRECT_URL`
3. *Storage → New bucket* : nom **`attachments`**, **Private** (décoché « Public »).
4. *Project Settings → API* : `Project URL` → `SUPABASE_URL` ; clé **service_role** → `SUPABASE_SERVICE_KEY` (secrète : jamais dans le code ni dans le navigateur).

### 2. Créer les tables et les comptes (une seule fois, depuis ton Mac)
Mets les 4 valeurs dans `.env` (modèle : `.env.example`), puis : `npm install && npm run db:init`

### 3. Vercel (site + API)
1. *Add New → Project* → importe le dépôt GitHub. **Root Directory : vide (racine du dépôt)**. Framework : *Other*.
   Le fichier `vercel.json` s'occupe du reste (build, dossier de sortie, routage).
2. *Settings → Environment Variables* : `DATABASE_URL`, `JWT_SECRET` (`openssl rand -hex 32`), `SUPABASE_URL`,
   `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET=attachments`, `PUBLIC_BASE_URL` (l'adresse du site), `OPENROUTER_API_KEY`.
   **Ne mets PAS** `VITE_API_URL`.
3. *Deploy*. Puis ouvre l'adresse : 7 profils, code `0000`, **chaque admin change son code**.

### À savoir
- Si tu modifies le code du serveur : `npm run build:api` régénère `api/index.js` (Vercel le refait aussi au build) — commite-le.
- Photos : réduites à ~1800 px avant envoi (limite Vercel 4,5 Mo par requête).
- Supabase gratuit met le projet en pause après ~1 semaine sans activité : un clic pour le relancer.
- Vercel *Hobby* est réservé à un usage non commercial (conditions de Vercel).


## Features livrées V1

| Feature | Statut | Détails |
|---|---|---|
| Auth PIN (admin 6 / membres 4) | ✅ | bcrypt, lockout 5 essais, JWT 12h, switch user, onboarding 1ère connexion |
| Création commande | ✅ | Code auto `LB-YYYYMM-XXXX`, services multi-select, lignes, urgence, livraison |
| Détail commande | ✅ | 5 onglets : Infos / Paiements / Pièces jointes / Historique / Carnet |
| Multi-paiements | ✅ | Espèces / Carte / Virement / Chèque / D17 / Edinar — auto-update statut paiement |
| Kanban temps réel | ✅ | Drag-and-drop @dnd-kit + mise à jour automatique des autres postes (4 s) |
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
| Évènements | ✅ | Table `Event` relue par chaque poste (`GET /api/events`) : `order.created`, `order.status_changed`, `post.created`… |
| **Responsive PC / tablette / mobile** | ✅ | Sidebar collapse < 900px (icônes seules), TopBar adaptatif, login keypad full-screen mobile |
| Design fidèle | ✅ | Tokens extraits de `screens.jsx` (COLORS, FONT) — composants Logo, StatusPill, UrgencyDot, etc. |
| Format Tunisien | ✅ | Téléphones `+216 28 555 123`, devise TND avec millimes, dates dd/MM/yyyy |

## Reportés V2 (documentés)

- **Scan IA pochette** : opérationnel (OpenRouter / OpenAI / Gemini / Anthropic, cascade configurable). Sans clé : mode démo à données factices.
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
POST   /orders/:id/status        Changer statut → notifie les autres postes
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
- ✅ Status change `RECUE → EN_PRODUCTION` (notifie les autres postes)
- ✅ Multi-payment : 10 + 40 = 50 → auto status `PAYE`
- ✅ Public tracking sans token (timeline + données restreintes)
- ✅ QR PNG (HTTP 200, 2110 bytes)
- ✅ Carnet post creation + resolution (status `RESOLVED`)
- ✅ Dashboard counters reflètent les changements en temps réel

Vérification visuelle massive dans le navigateur (3 viewports) :

**Desktop 1280×720** : Login picker, login keypad, Dashboard, Kanban, Orders list, Order detail (Infos + Paiements + Carnet tabs), Order new, Profile, Team (avec modal "Définir un PIN"), Scan, Carnet wall, Pour Moi, Composer (étape 1 + étape 2), Customers, Cash, Public tracking — **tous OK**.

**Tablette 1024×768** : Dashboard 3 colonnes, Orders avec scroll horizontal, Kanban — sidebar et layout adaptés.

**Mobile 390×844** : Sidebar collapse en icônes seules, TopBar avec titre tronqué propre + bouton "+" compact, Login keypad full-screen avec branding header compact, Login picker en 2 colonnes, cards stack vertical.

**Synchronisation vérifiée** :
- Sonia (session A) crée la commande `LB-202605-0007 Sync Test` via API
- Adel (session B) sur Kanban voit la nouvelle carte apparaître **automatiquement** (compteur passé de 1 à 2 sur "Reçue", sidebar Commandes 5 → 6)
- Sonia change ensuite le statut → `EN_PRODUCTION` → la carte se déplace **automatiquement** dans la colonne Production sur l'écran d'Adel sans reload

**Tests PIN** :
- ✅ Sonia change son propre PIN `1234 → 9876` → login avec 9876 OK
- ✅ Adel (admin) définit nouveau PIN pour Sonia `9876 → 1234` → login OK
- ✅ Tentative `change-pin` avec mauvais PIN actuel → rejeté `bad_current_pin`
- ✅ JWT validité = 30 jours (pas de re-login dans la journée)

## Décisions de conception

- **PostgreSQL (Supabase)** : base gérée et gratuite, compatible hébergement sans serveur ; fichiers dans Supabase Storage.
- **Pas de monorepo pnpm** : npm fonctionne, deux projets indépendants (api/ et web/) — moins de magie, plus simple à déployer.
- **TypeScript strict** : zéro `any`, validation Zod sur toutes les entrées API.
- **Tokens design fidèles** : `web/src/lib/tokens.ts` réplique `COLORS` de `screens.jsx`.
- **Sondage vs WebSocket** : Vercel n'accepte pas les WebSocket ; un sondage léger toutes les 4 s (onglet visible) suffit pour 7 postes.
- **Adapter pattern Vision** : prêt à brancher GLM-OCR / Gemini / OpenAI sans toucher au code appelant.
- **Soft-delete commandes** : `deletedAt` au lieu de DELETE physique.
- **Permissions** : par middleware `requireAuth` + `requireRole('ADMIN')`.

---

**Build par Claude Sonnet · session du 2026-05-10. Spec source : PROMPT_ULTIME_EL_BENNA.md + ADDENDUM_1_CARNET_EQUIPE.md.**
