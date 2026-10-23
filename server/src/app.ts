import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';

import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import usersRoutes from './routes/users.js';
import customersRoutes from './routes/customers.js';
import ordersRoutes from './routes/orders.js';
import postsRoutes from './routes/posts.js';
import trackRoutes from './routes/track.js';
import catalogRoutes from './routes/catalog.js';
import visionRoutes from './routes/vision.js';
import financeRoutes from './routes/finance.js';
import absencesRoutes from './routes/absences.js';
import uploadsRoutes from './routes/uploads.js';
import eventsRoutes from './routes/events.js';
import { UPLOAD_DIR, usesSupabase } from './storage.js';

const PROD = process.env.NODE_ENV === 'production';

// Construit l'application SANS l'écouter : utilisée par le serveur local (index.ts)
// et par la fonction Vercel (vercel.ts).
export async function buildApp(): Promise<FastifyInstance> {
  // En production on refuse de démarrer avec un secret de développement : il permettrait de
  // fabriquer des jetons de connexion (donc des sessions admin) valables 30 jours.
  const secret = process.env.JWT_SECRET ?? '';
  if (PROD && (secret.length < 32 || /change|dev-secret|dev_secret/i.test(secret))) {
    throw new Error('JWT_SECRET absent ou faible. Génère-en un : openssl rand -hex 32');
  }

  // trustProxy : derrière le proxy de l'hébergeur, req.ip = vraie IP du client (journal d'audit)
  const app = Fastify({ logger: { level: 'info' }, trustProxy: PROD });

  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
  // plusieurs adresses possibles, séparées par des virgules
  const ORIGINS = [...FRONTEND_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean), 'http://localhost:5173', 'http://127.0.0.1:5173'];
  await app.register(cors, { origin: ORIGINS, credentials: true });
  await app.register(jwt, { secret: secret || 'dev-secret-change-me' });
  await app.register(multipart, { limits: { fileSize: 12 * 1024 * 1024 } });

  // Pièces jointes sur disque (développement uniquement) ; en production elles sont dans Supabase Storage
  if (!usesSupabase()) await app.register(staticPlugin, { root: UPLOAD_DIR, prefix: '/uploads/', decorateReply: false });

  app.get('/health', async () => ({ ok: true, ts: new Date().toISOString() }));

  // Toute l'API vit sous /api : les adresses sans préfixe (/orders/12, /track/LB-…) restent celles des pages du site.
  await app.register(async (api) => {
    await api.register(authRoutes);
    await api.register(meRoutes);
    await api.register(usersRoutes);
    await api.register(customersRoutes);
    await api.register(ordersRoutes);
    await api.register(postsRoutes);
    await api.register(trackRoutes);
    await api.register(catalogRoutes);
    await api.register(visionRoutes);
    await api.register(financeRoutes);
    await api.register(absencesRoutes);
    await api.register(uploadsRoutes);
    await api.register(eventsRoutes);
  }, { prefix: '/api' });

  return app;
}
