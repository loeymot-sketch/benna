import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Configuration minimale : à importer en premier (avant Prisma).
// 1) Fichier de secours optionnel `server/production.env` (même format que .env) : utile si l'hébergeur
//    ne transmet pas ses variables. Il ne remplace jamais une variable déjà définie.
// 2) Valeurs déduites de l'hébergeur (adresse publique du site sur Vercel).

const here = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.join(process.cwd(), 'server', 'production.env'),
  path.resolve(here, '../production.env'),        // exécution depuis server/src (tsx)
  path.resolve(here, '../server/production.env'), // bundle api/index.js
];
for (const file of candidates) {
  try {
    if (!fs.existsSync(file)) continue;
    const parsed = dotenv.parse(fs.readFileSync(file));
    for (const [k, v] of Object.entries(parsed)) if (!(process.env[k] ?? '').trim()) process.env[k] = v;
    process.env.CONFIG_FALLBACK_FILE = file;
    break;
  } catch { /* fichier illisible : on continue avec les variables présentes */ }
}

if (!(process.env.PUBLIC_BASE_URL ?? '').trim()) {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (host) process.env.PUBLIC_BASE_URL = `https://${host}`;
}

export const PROD = process.env.NODE_ENV === 'production';
export const hasDatabaseUrl = () => /^postgres(ql)?:\/\//.test((process.env.DATABASE_URL ?? '').trim());
