import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
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
import uploadsRoutes, { UPLOAD_DIR } from './routes/uploads.js';
import { initIO } from './io.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROD = process.env.NODE_ENV === 'production';

// En production on refuse de démarrer avec un secret de développement : il permettrait de
// fabriquer des jetons de connexion (donc des sessions admin) valables 30 jours.
if (PROD) {
  const secret = process.env.JWT_SECRET ?? '';
  if (secret.length < 32 || /change|dev-secret|dev_secret/i.test(secret)) {
    console.error('✖ JWT_SECRET absent ou faible. Génère-en un :  openssl rand -hex 32  (puis mets-le dans api/.env)');
    process.exit(1);
  }
}

// trustProxy : derrière le reverse proxy de l'hébergeur, req.ip = vraie IP du client (journal d'audit)
const app = Fastify({ logger: { level: 'info' }, trustProxy: PROD });

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
// FRONTEND_ORIGIN peut contenir plusieurs adresses séparées par des virgules (ex. domaine Vercel + domaine perso)
const ORIGINS = [...FRONTEND_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean), 'http://localhost:5173', 'http://127.0.0.1:5173'];

await app.register(cors, { origin: ORIGINS, credentials: true });

await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
});

await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });

await app.register(staticPlugin, {
  root: UPLOAD_DIR,
  prefix: '/uploads/',
});

app.get('/health', async () => ({ ok: true, ts: new Date().toISOString() }));

// Production : l'API sert aussi l'application web compilée (web/dist) — un seul processus, un seul port.
const WEB_DIST = path.resolve(__dirname, '../../web/dist');
const SERVE_WEB = PROD && fs.existsSync(path.join(WEB_DIST, 'index.html'));
if (SERVE_WEB) {
  await app.register(staticPlugin, { root: WEB_DIST, prefix: '/', decorateReply: false, wildcard: false, index: ['index.html'] });
} else if (PROD) {
  console.warn('⚠ web/dist introuvable : lance « npm run build » dans web/ (ou ./start-prod.sh).');
}

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
}, { prefix: '/api' });

const PORT = Number(process.env.PORT ?? 8081);
const HOST = '0.0.0.0';

// Pages de l'application (/orders/12, /carnet…) : toujours renvoyer index.html (routage côté navigateur)
if (SERVE_WEB) {
  const indexHtml = fs.readFileSync(path.join(WEB_DIST, 'index.html'));
  app.setNotFoundHandler((req, reply) => {
    const isPage = req.method === 'GET' && (req.headers.accept ?? '').includes('text/html');
    if (!isPage) return reply.code(404).send({ error: 'not_found' });
    return reply.type('text/html').send(indexHtml);
  });
}

await app.listen({ port: PORT, host: HOST });
initIO(app.server, ORIGINS);
app.log.info(`elbenna-api ready on http://localhost:${PORT}`);
