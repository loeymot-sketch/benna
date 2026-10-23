#!/usr/bin/env bash
# Développement local : API (8787) + site (5173, relié à l'API par proxy).
# Pré-requis : .env rempli (DATABASE_URL / DIRECT_URL d'un Postgres, ex. un projet Supabase de test) — voir .env.example.
set -e
cd "$(dirname "$0")"
[ -f .env ] || { echo "✖ .env manquant : copie .env.example en .env et renseigne DATABASE_URL / DIRECT_URL"; exit 1; }
[ -d node_modules ] || npm install --no-audit --no-fund
[ -d web/node_modules ] || (cd web && npm install --no-audit --no-fund)
echo "▶ Base de données (tables + comptes si absents)…"
npm run -s db:init
echo "▶ API :8787 + site :5173"
npm run dev &
API_PID=$!
(cd web && npm run dev) &
WEB_PID=$!
trap "kill $API_PID $WEB_PID 2>/dev/null" EXIT INT TERM
echo ""
echo "════════════════════════════════════════════════════════"
echo "   EL BENNA LAB OS · http://localhost:5173"
echo "   Comptes : Seif · Ghaith · Imed · Mounira · Najet · Invité 1 · Invité 2"
echo "   Code par défaut : 0000 (à changer à la 1ère connexion)"
echo "════════════════════════════════════════════════════════"
wait
