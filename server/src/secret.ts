import { randomBytes } from 'node:crypto';
import { prisma } from './db.js';
import { PROD } from './config.js';

const WEAK = /change|dev-secret|dev_secret/i;
const SETTING_KEY = 'jwt_secret';

// Secret des jetons de session.
//  - JWT_SECRET défini et solide : on l'utilise.
//  - Production sans JWT_SECRET : un secret est généré une seule fois et conservé dans la table Setting,
//    donc identique pour toutes les instances et tous les déploiements (aucune variable à saisir).
//  - Développement : valeur fixe si rien n'est défini.
export async function resolveJwtSecret(): Promise<string> {
  const fromEnv = (process.env.JWT_SECRET ?? '').trim();
  if (fromEnv) {
    if (PROD && (fromEnv.length < 32 || WEAK.test(fromEnv))) {
      throw new Error('JWT_SECRET trop faible : supprime la variable (un secret sera généré) ou mets 32+ caractères aléatoires');
    }
    return fromEnv;
  }
  if (!PROD) return 'dev-secret-change-me';

  // Base créée avant l'ajout de la table Setting : on la crée à la volée (idempotent).
  await prisma.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS "Setting" ("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL)');
  const existing = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
  const stored = parse(existing?.value);
  if (stored) return stored;

  const fresh = randomBytes(32).toString('hex');
  try {
    await prisma.setting.create({ data: { key: SETTING_KEY, value: JSON.stringify(fresh) } });
    return fresh;
  } catch {
    // Deux instances ont démarré en même temps : la première a gagné, on relit.
    const again = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    const v = parse(again?.value);
    if (v) return v;
    throw new Error('Impossible de créer le secret de session dans la base');
  }
}

function parse(json: string | undefined): string | null {
  if (!json) return null;
  try { const v = JSON.parse(json); return typeof v === 'string' && v.length >= 32 ? v : null; } catch { return null; }
}
