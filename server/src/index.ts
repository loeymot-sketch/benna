import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import staticPlugin from '@fastify/static';
import { buildApp } from './app.js';

// Serveur local (développement, ou hébergement classique). Sur Vercel c'est vercel.ts qui est utilisé.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROD = process.env.NODE_ENV === 'production';

const app = await buildApp();

// Production sur un seul serveur : sert aussi le site compilé (web/dist)
const WEB_DIST = path.resolve(__dirname, '../../web/dist');
if (PROD && fs.existsSync(path.join(WEB_DIST, 'index.html'))) {
  await app.register(staticPlugin, { root: WEB_DIST, prefix: '/', decorateReply: false, wildcard: false, index: ['index.html'] });
  const indexHtml = fs.readFileSync(path.join(WEB_DIST, 'index.html'));
  app.setNotFoundHandler((req, reply) => {
    const isPage = req.method === 'GET' && (req.headers.accept ?? '').includes('text/html');
    if (!isPage) return reply.code(404).send({ error: 'not_found' });
    return reply.type('text/html').send(indexHtml);
  });
}

const PORT = Number(process.env.PORT ?? 8787);
await app.listen({ port: PORT, host: '0.0.0.0' });
app.log.info(`elbenna-api ready on http://localhost:${PORT}`);
