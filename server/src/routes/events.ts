import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';

export default async function eventsRoutes(app: FastifyInstance) {
  // Sans `after` : renvoie seulement le dernier id (point de départ du poste). Avec `after` : évènements suivants.
  app.get('/events', { preHandler: requireAuth }, async (req) => {
    const { after } = z.object({ after: z.coerce.number().int().optional() }).parse((req as any).query);
    if (after === undefined) {
      const last = await prisma.event.findFirst({ orderBy: { id: 'desc' }, select: { id: true } });
      return { events: [], last: last?.id ?? 0 };
    }
    const rows = await prisma.event.findMany({ where: { id: { gt: after } }, orderBy: { id: 'asc' }, take: 200 });
    return {
      events: rows.map((r) => ({ id: r.id, type: r.type, payload: JSON.parse(r.payload) })),
      last: rows.length ? rows[rows.length - 1].id : after,
    };
  });
}
