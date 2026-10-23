#!/usr/bin/env bash
# Démarrage PRODUCTION : un seul processus (API + site compilé) sur le port de api/.env (8787 par défaut).
# Première exécution : crée api/.env (secret aléatoire), installe, compile, crée la base et les comptes.
# Ensuite : relance simplement l'application.   Usage :  ./start-prod.sh
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f api/.env ]; then
  echo "▶ Création de api/.env (secret aléatoire)…"
  sed -e "s|^JWT_SECRET=.*|JWT_SECRET=\"$(openssl rand -hex 32)\"|" api/.env.example > api/.env
  chmod 600 api/.env
  echo "  ⚠ Ouvre api/.env : renseigne FRONTEND_ORIGIN / PUBLIC_BASE_URL (adresse du site) et la clé du scan IA."
fi

[ -d api/node_modules ] || (cd api && npm ci --no-audit --no-fund)
[ -d web/node_modules ] || (cd web && npm ci --no-audit --no-fund)

echo "▶ Compilation du site…"
(cd web && npm run build)

echo "▶ Base de données (création/mise à jour, comptes si absents)…"
(cd api && npm run -s db:init)

echo "▶ Démarrage — http://localhost:$(grep -E '^PORT=' api/.env | cut -d= -f2 | tr -d '\"' || echo 8787)"
cd api && exec npm run -s start:prod
