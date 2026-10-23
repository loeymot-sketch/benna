import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { audit } from '../audit.js';
import { emit } from '../io.js';

export default async function absencesRoutes(app: FastifyInstance) {
  app.get('/absences', { preHandler: requireAuth }, async () => {
    const absences = await prisma.absence.findMany({
      orderBy: { startDate: 'asc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        substitute: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return { absences };
  });

  app.post('/absences', { preHandler: requireAuth }, async (req) => {
    const Body = z.object({
      userId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      type: z.enum(['CONGE','MALADIE','RDV','FORMATION','AUTRE']),
      notes: z.string().optional().nullable(),
      substituteId: z.string().optional().nullable(),
    });
    const data = Body.parse(req.body);
    const absence = await prisma.absence.create({
      data: {
        userId: data.userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        type: data.type,
        notes: data.notes ?? null,
        substituteId: data.substituteId ?? null,
        status: 'PENDING',
      },
      include: { user: true, substitute: true },
    });
    // Auto-create ABSENCE_NOTE post (R-1)
    const post = await prisma.teamPost.create({
      data: {
        type: 'ABSENCE_NOTE',
        body: `${absence.user.firstName} ${absence.user.lastName} : absent du ${data.startDate} au ${data.endDate}` +
              (absence.substitute ? ` (remplaçant : ${absence.substitute.firstName})` : ''),
        authorId: req.user.sub,
        scope: 'ALL',
        urgency: 'NORMAL',
        pinnedUntil: new Date(data.endDate),
        absenceId: absence.id,
      },
    });
    await audit({ userId: req.user.sub, action: 'ABSENCE_CREATED', entityType: 'Absence', entityId: absence.id });
    emit('absence.created', { id: absence.id, postId: post.id });
    return { absence, post };
  });

  app.post('/absences/:id/approve', { preHandler: [requireAuth, requireRole('ADMIN')] }, async (req) => {
    const { id } = req.params as { id: string };
    const a = await prisma.absence.update({
      where: { id }, data: { status: 'APPROVED', approvedById: req.user.sub },
    });
    await audit({ userId: req.user.sub, action: 'ABSENCE_APPROVED', entityType: 'Absence', entityId: id });
    return { absence: a };
  });
}
