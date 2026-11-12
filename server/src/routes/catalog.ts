import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { audit } from '../audit.js';

const admin = [requireAuth, requireRole('ADMIN')];

// Code technique unique dérivé du nom (« Tirage grand format » → TIRAGE_GRAND_FORMAT)
async function uniqueCode(name: string) {
  const base = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30) || 'SERVICE';
  let code = base;
  for (let i = 2; await prisma.service.findUnique({ where: { code } }); i++) code = `${base}_${i}`;
  return code;
}

export default async function catalogRoutes(app: FastifyInstance) {
  // ?all=1 (admin) : inclut les services désactivés pour la page de gestion
  app.get('/services', { preHandler: requireAuth }, async (req) => {
    const all = (req.query as any)?.all === '1' && req.user.role === 'ADMIN';
    const services = await prisma.service.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { orders: true, catalogItems: true } } },
    });
    return { services };
  });

  app.post('/services', { preHandler: admin }, async (req) => {
    const Body = z.object({ name: z.string().trim().min(1), icon: z.string().trim().max(8).optional().nullable() });
    const data = Body.parse(req.body);
    const service = await prisma.service.create({ data: { name: data.name, icon: data.icon || '✨', code: await uniqueCode(data.name) } });
    await audit({ userId: req.user.sub, action: 'SERVICE_CREATED', entityType: 'Service', entityId: service.id, payload: data });
    return { service };
  });

  app.patch('/services/:id', { preHandler: admin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({
      name: z.string().trim().min(1).optional(),
      icon: z.string().trim().max(8).nullable().optional(),
      isActive: z.boolean().optional(),
    });
    const data = Body.parse(req.body);
    if (!(await prisma.service.findUnique({ where: { id } }))) return reply.code(404).send({ error: 'not_found' });
    const service = await prisma.service.update({ where: { id }, data });
    await audit({ userId: req.user.sub, action: 'SERVICE_UPDATED', entityType: 'Service', entityId: id, payload: data });
    return { service };
  });

  app.get('/catalog', { preHandler: requireAuth }, async (req) => {
    const all = (req.query as any)?.all === '1' && req.user.role === 'ADMIN';
    const items = await prisma.catalogItem.findMany({
      where: all ? {} : { isActive: true },
      include: { service: true },
      orderBy: { name: 'asc' },
    });
    return { items };
  });

  const ItemBody = z.object({
    name: z.string().trim().min(1),
    serviceId: z.string(),
    unitPrice: z.number().nonnegative(),
    unit: z.string().trim().min(1).default('unité'),
  });

  app.post('/catalog', { preHandler: admin }, async (req) => {
    const data = ItemBody.parse(req.body);
    const item = await prisma.catalogItem.create({ data, include: { service: true } });
    await audit({ userId: req.user.sub, action: 'CATALOG_ITEM_CREATED', entityType: 'CatalogItem', entityId: item.id, payload: data });
    return { item };
  });

  app.patch('/catalog/:id', { preHandler: admin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const data = ItemBody.partial().extend({ isActive: z.boolean().optional() }).parse(req.body);
    if (!(await prisma.catalogItem.findUnique({ where: { id } }))) return reply.code(404).send({ error: 'not_found' });
    const item = await prisma.catalogItem.update({ where: { id }, data, include: { service: true } });
    await audit({ userId: req.user.sub, action: 'CATALOG_ITEM_UPDATED', entityType: 'CatalogItem', entityId: id, payload: data });
    return { item };
  });

  app.get('/shops', { preHandler: requireAuth }, async () => {
    const shops = await prisma.shop.findMany({ where: { isActive: true } });
    return { shops };
  });
}
