import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { audit } from '../audit.js';

export default async function usersRoutes(app: FastifyInstance) {
  // List members (everyone authenticated can see for assignment, mentions, etc.)
  app.get('/users', { preHandler: requireAuth }, async () => {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: 'asc' }],
      select: {
        id: true, firstName: true, lastName: true, role: true,
        shopId: true, avatar: true,
      },
    });
    return { users };
  });

  // Admin: full team management
  app.get('/admin/users', { preHandler: [requireAuth, requireRole('ADMIN')] }, async () => {
    const users = await prisma.user.findMany({
      orderBy: [{ isActive: 'desc' }, { firstName: 'asc' }],
      include: { shop: true },
    });
    return { users: users.map((u) => ({
      id: u.id, firstName: u.firstName, lastName: u.lastName, role: u.role,
      shopId: u.shopId, shop: u.shop, avatar: u.avatar, isActive: u.isActive,
      pinSet: u.pinSet, mustChangePin: u.mustChangePin, lockedUntil: u.lockedUntil,
    })) };
  });

  app.post('/admin/users', { preHandler: [requireAuth, requireRole('ADMIN')] }, async (req, reply) => {
    const Body = z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.enum(['ADMIN','MANAGER','RECEPTION','DESIGNER','PRODUCTION','PHOTOGRAPHER']),
      shopId: z.string().nullable().optional(),
    });
    const data = Body.parse(req.body);
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        shopId: data.shopId ?? null,
        pinHash: '__not_set__',
        pinSet: false,
      },
    });
    await audit({ userId: req.user.sub, action: 'USER_CREATED', entityType: 'User', entityId: user.id, payload: data });
    return { user };
  });

  app.post('/admin/users/:id/reset-pin', { preHandler: [requireAuth, requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.user.update({
      where: { id },
      data: { pinSet: false, pinHash: '__not_set__', failedAttempts: 0, lockedUntil: null },
    });
    await audit({ userId: req.user.sub, action: 'USER_PIN_RESET', entityType: 'User', entityId: id });
    return { ok: true };
  });

  // Admin sets a new PIN directly (e.g. employee forgot, or admin imposes a value)
  app.post('/admin/users/:id/set-pin', { preHandler: [requireAuth, requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({ pin: z.string().regex(/^\d{4,6}$/) });
    const { pin } = Body.parse(req.body);
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return reply.code(404).send({ error: 'not_found' });
    const expected = u.role === 'ADMIN' ? 6 : 4;
    if (pin.length !== expected) return reply.code(400).send({ error: 'pin_length', expected });
    const pinHash = await bcrypt.hash(pin, 10);
    await prisma.user.update({
      where: { id },
      data: { pinHash, pinSet: true, mustChangePin: id !== req.user.sub, failedAttempts: 0, lockedUntil: null },
    });
    await audit({
      userId: req.user.sub, action: 'USER_PIN_SET_BY_ADMIN',
      entityType: 'User', entityId: id, ipAddress: req.ip,
    });
    return { ok: true };
  });

  app.post('/admin/users/:id/toggle', { preHandler: [requireAuth, requireRole('ADMIN')] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return { ok: false };
    if (u.isActive && u.role === 'ADMIN') {
      const otherAdmins = await prisma.user.count({ where: { role: 'ADMIN', isActive: true, id: { not: id } } });
      if (id === req.user.sub || otherAdmins === 0) {
        return reply.code(400).send({ error: id === req.user.sub ? 'cannot_disable_self' : 'last_admin' });
      }
    }
    const updated = await prisma.user.update({ where: { id }, data: { isActive: !u.isActive } });
    await audit({ userId: req.user.sub, action: 'USER_TOGGLED', entityType: 'User', entityId: id, payload: { isActive: updated.isActive } });
    return { ok: true, isActive: updated.isActive };
  });
}
