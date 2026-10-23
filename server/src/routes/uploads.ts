import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';
import { audit } from '../audit.js';
import { putFile, fileUrl, readBlob } from '../storage.js';

// Jeton court (1 h) qui autorise la lecture d'UN fichier précis (les <img> ne peuvent pas envoyer d'en-tête Authorization)
export const signFile = (app: FastifyInstance, key: string) => app.jwt.sign({ scope: 'file', key } as any, { expiresIn: '1h' });

const ALLOWED = /^(image\/(jpeg|png|webp|gif)|application\/pdf)$/;

export default async function uploadsRoutes(app: FastifyInstance) {
  app.post('/orders/:id/attachments', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return reply.code(404).send({ error: 'order_not_found' });

    const data = await (req as any).file();
    if (!data) return reply.code(400).send({ error: 'no_file' });
    if (!ALLOWED.test(data.mimetype)) return reply.code(415).send({ error: 'unsupported_type', message: 'Image ou PDF uniquement.' });

    const kind = (data.fields?.kind?.value ?? 'REFERENCE') as string;
    const safeName = data.filename.replace(/[^\w.\-]/g, '_');
    const key = `${id}/${Date.now()}-${safeName}`;
    const buf: Buffer = await data.toBuffer();
    await putFile(key, buf, data.mimetype);

    const att = await prisma.attachment.create({
      data: { orderId: id, filename: data.filename, path: key, mimeType: data.mimetype, size: buf.length, kind },
    });
    await audit({ userId: req.user.sub, action: 'ATTACHMENT_UPLOADED', entityType: 'Order', entityId: id, payload: { kind, filename: data.filename } });
    return { attachment: { ...att, url: await fileUrl(att.path, (k) => signFile(app, k)) } };
  });

  // Lecture d'un fichier stocké en base : jeton ?t= signé par le serveur, valable pour cette clé uniquement
  app.get('/files/*', async (req, reply) => {
    const key = decodeURIComponent((req.params as any)['*']);
    const t = String((req.query as any).t ?? '');
    try {
      const claims = app.jwt.verify<{ scope: string; key: string }>(t);
      if (claims.scope !== 'file' || claims.key !== key) throw new Error('bad_scope');
    } catch {
      return reply.code(403).send({ error: 'forbidden' });
    }
    const blob = await readBlob(key);
    if (!blob) return reply.code(404).send({ error: 'not_found' });
    reply.header('cache-control', 'private, max-age=3600').header('content-type', blob.mimeType);
    return reply.send(Buffer.from(blob.data));
  });
}
