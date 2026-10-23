import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../auth.js';
import { configuredProviders, extractPouch } from '../vision.js';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024;

// Données factices renvoyées UNIQUEMENT quand aucune clé API n'est configurée,
// pour pouvoir tester l'UI. Toujours marquées `stub: true`.
const MOCK = {
  pouchNumber: '0061340',
  customerName: 'Abdelwahab Khelifi',
  phone: '+216 28 555 123',
  date: new Date().toISOString().slice(0, 10),
  totalAmount: 12.0,
  depositAmount: 5.0,
  description: '50 cartes visite carton 250g',
  confidence: {
    pouchNumber: 0.95, customerName: 0.85, phone: 0.7, date: 0.9,
    totalAmount: 0.8, depositAmount: 0.6, description: 0.92,
  },
  notes: 'Données factices — aucune clé API Vision configurée',
};

export default async function visionRoutes(app: FastifyInstance) {
  // Statut du provider, pour que l'UI affiche si le scan est réel ou en démo.
  app.get('/vision/status', { preHandler: requireAuth }, async () => {
    const providers = configuredProviders().map((p) => p.name);
    return { configured: providers.length > 0, providers };
  });

  // multipart/form-data : champ `file` = photo de la pochette (jpeg/png/webp, 10 Mo max).
  app.post('/vision/extract-pouch', { preHandler: requireAuth }, async (req, reply) => {
    if (configuredProviders().length === 0) {
      const f = await (req as any).file();
      if (f) await f.toBuffer(); // vide le flux multipart
      return { stub: true, provider: null, message: 'Aucune clé API Vision configurée (OPENAI_API_KEY / GEMINI_API_KEY / ANTHROPIC_API_KEY). Données factices.', data: MOCK };
    }

    const file = await (req as any).file();
    if (!file) return reply.code(400).send({ error: 'no_file', message: 'Photo de la pochette manquante.' });
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return reply.code(415).send({ error: 'unsupported_type', message: 'Format accepté : JPG, PNG ou WebP.' });
    }
    const buf: Buffer = await file.toBuffer();
    if (file.file.truncated || buf.length > MAX_BYTES) {
      return reply.code(413).send({ error: 'file_too_large', message: 'Image trop lourde (10 Mo max).' });
    }

    const result = await extractPouch({ base64: buf.toString('base64'), mimeType: file.mimetype });
    if (!result.ok) {
      req.log.error({ errors: result.errors }, 'vision extraction failed');
      return reply.code(502).send({ error: 'vision_failed', message: 'Extraction impossible — saisie manuelle requise.', details: result.errors });
    }
    return { stub: false, provider: result.provider, data: result.data };
  });
}
