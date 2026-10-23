import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';

// Point d'entrée de la fonction Vercel (empaquetée en api/index.js par `npm run build:api`).
// L'application est construite une fois par instance « chaude », puis réutilisée.
let ready: Promise<FastifyInstance> | null = null;

// Diagnostic de configuration, disponible même si l'application ne démarre pas (aucune valeur secrète affichée).
function diag() {
  const e = process.env;
  const info = (k: string) => { const v = e[k] ?? ''; return { present: v.length > 0, length: v.length, spacesOrQuotes: v !== v.trim() || /^["']|["']$/.test(v) }; };
  return {
    deployment: { env: e.VERCEL_ENV, commit: (e.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7), region: e.VERCEL_REGION, node: process.version, deploymentId: e.VERCEL_DEPLOYMENT_ID, url: e.VERCEL_URL, productionUrl: e.VERCEL_PROJECT_PRODUCTION_URL, branchUrl: e.VERCEL_BRANCH_URL },
    vars: { JWT_SECRET: info('JWT_SECRET'), DATABASE_URL: { ...info('DATABASE_URL'), looksLikePostgres: /^postgres(ql)?:\/\//.test(e.DATABASE_URL ?? '') }, PUBLIC_BASE_URL: info('PUBLIC_BASE_URL'), OPENROUTER_API_KEY: info('OPENROUTER_API_KEY') },
    namesSeen: Object.keys(e).filter((k) => /jwt|secret|database|supabase|openrouter|base_url|node_env/i.test(k)).sort(),
  };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if ((req.url ?? '').startsWith('/api/diag')) {
    res.setHeader('content-type', 'application/json');
    return void res.end(JSON.stringify(diag(), null, 2));
  }
  try {
    ready ??= buildApp().then(async (a) => { await a.ready(); return a; }).catch((e) => { ready = null; throw e; });
    const app = await ready;
    app.server.emit('request', req, res);
  } catch (e: any) {
    // Échec au démarrage (variable manquante, module introuvable…) : message court au lieu d'une page d'erreur muette
    console.error('startup failed', e);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'startup_failed', message: String(e?.message ?? e).split('\n')[0].slice(0, 300) }));
  }
}
