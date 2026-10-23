import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';

// Point d'entrée de la fonction Vercel (empaquetée en api/index.js par `npm run build:api`).
// L'application est construite une fois par instance « chaude », puis réutilisée.
let ready: Promise<FastifyInstance> | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
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
