import type { FastifyInstance } from 'fastify';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';
import { audit } from '../audit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// UPLOAD_DIR : dossier des pièces jointes (en hébergement, pointer vers le volume persistant, ex. /data/uploads)
const UPLOAD_DIR = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve(__dirname, '../../data/uploads');

export default async function uploadsRoutes(app: FastifyInstance) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  app.post('/orders/:id/attachments', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return reply.code(404).send({ error: 'order_not_found' });

    const data = await (req as any).file();
    if (!data) return reply.code(400).send({ error: 'no_file' });

    const kind = (data.fields?.kind?.value ?? 'REFERENCE') as string;
    const safeName = data.filename.replace(/[^\w.\-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const orderDir = path.join(UPLOAD_DIR, id);
    await fs.mkdir(orderDir, { recursive: true });
    const fullPath = path.join(orderDir, filename);
    const buf = await data.toBuffer();
    await fs.writeFile(fullPath, buf);

    const att = await prisma.attachment.create({
      data: {
        orderId: id,
        filename: data.filename,
        path: `/uploads/${id}/${filename}`,
        mimeType: data.mimetype,
        size: buf.length,
        kind,
      },
    });
    await audit({ userId: req.user.sub, action: 'ATTACHMENT_UPLOADED', entityType: 'Order', entityId: id, payload: { kind, filename } });
    return { attachment: att };
  });
}

export { UPLOAD_DIR };
