#!/usr/bin/env bash
# Quick-start: installs deps, seeds DB, launches API + Web in parallel.
set -e
cd "$(dirname "$0")"

if [ ! -d api/node_modules ]; then
  echo "▶ Installing API dependencies..."
  (cd api && npm install --no-audit --no-fund)
fi

if [ ! -d web/node_modules ]; then
  echo "▶ Installing Web dependencies..."
  (cd web && npm install --no-audit --no-fund)
fi

if [ ! -f api/data/dev.db ]; then
  echo "▶ Creating database..."
  (cd api && npm run -s db:init)   # base + comptes réels (code 0000). Données de démo : npm run db:seed-demo
fi

echo "▶ Starting API on :8787..."
(cd api && PORT=8787 npx tsx src/index.ts) &
API_PID=$!

echo "▶ Starting Web on :5173..."
(cd web && npm run dev) &
WEB_PID=$!

trap "kill $API_PID $WEB_PID 2>/dev/null" EXIT INT TERM

echo ""
echo "════════════════════════════════════════════════════════"
echo "   EL BENNA LAB OS · http://localhost:5173"
echo "   Comptes : Seif · Ghaith · Imed · Mounira · Najet · Invité 1 · Invité 2"
echo "   Code par défaut : 0000 (à changer à la 1ère connexion)"
echo "════════════════════════════════════════════════════════"
echo ""
wait
