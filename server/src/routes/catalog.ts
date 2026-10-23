import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';

export default async function catalogRoutes(app: FastifyInstance) {
  app.get('/services', { preHandler: requireAuth }, async () => {
    const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
    return { services };
  });

  app.get('/catalog', { preHandler: requireAuth }, async () => {
    const items = await prisma.catalogItem.findMany({
      where: { isActive: true },
      include: { service: true },
      orderBy: { name: 'asc' },
    });
    return { items };
  });

  app.get('/shops', { preHandler: requireAuth }, async () => {
    const shops = await prisma.shop.findMany({ where: { isActive: true } });
    return { shops };
  });
}
