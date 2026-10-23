import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';
import { audit } from '../audit.js';
import { toActWhere } from '../inbox.js';

export default async function meRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: requireAuth }, async (req) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      include: { shop: true },
    });
    if (!user) return { user: null };
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        shopId: user.shopId,
        shop: user.shop,
        mustChangePin: user.mustChangePin,
      },
    };
  });

  // Change my own PIN
  app.post('/me/change-pin', { preHandler: requireAuth }, async (req, reply) => {
    const Body = z.object({
      currentPin: z.string().regex(/^\d{4,6}$/),
      newPin: z.string().regex(/^\d{4,6}$/),
    });
    const { currentPin, newPin } = Body.parse(req.body);
    const me = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!me) return reply.code(404).send({ error: 'not_found' });
    const ok = await bcrypt.compare(currentPin, me.pinHash);
    if (!ok) return reply.code(401).send({ error: 'bad_current_pin' });
    const expected = me.role === 'ADMIN' ? 6 : 4;
    if (newPin.length !== expected) {
      return reply.code(400).send({ error: 'pin_length', expected });
    }
    if (currentPin === newPin) return reply.code(400).send({ error: 'same_pin' });
    const pinHash = await bcrypt.hash(newPin, 10);
    await prisma.user.update({ where: { id: me.id }, data: { pinHash, mustChangePin: false } });
    await audit({
      userId: me.id, action: 'PIN_CHANGED_SELF',
      entityType: 'User', entityId: me.id, ipAddress: req.ip,
    });
    return { ok: true };
  });

  // Première connexion avec un code temporaire : choisir son code personnel (sans ressaisir le temporaire)
  app.post('/me/set-initial-pin', { preHandler: requireAuth }, async (req, reply) => {
    const { newPin } = z.object({ newPin: z.string().regex(/^\d{4,6}$/) }).parse(req.body);
    const me = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!me) return reply.code(404).send({ error: 'not_found' });
    if (!me.mustChangePin) return reply.code(409).send({ error: 'not_required' });
    const expected = me.role === 'ADMIN' ? 6 : 4;
    if (newPin.length !== expected) return reply.code(400).send({ error: 'pin_length', expected });
    if (await bcrypt.compare(newPin, me.pinHash)) return reply.code(400).send({ error: 'same_pin' });
    await prisma.user.update({ where: { id: me.id }, data: { pinHash: await bcrypt.hash(newPin, 10), mustChangePin: false } });
    await audit({ userId: me.id, action: 'PIN_CHANGED_FIRST_LOGIN', entityType: 'User', entityId: me.id, ipAddress: req.ip });
    return { ok: true };
  });

  // Inbox counters
  app.get('/me/inbox-count', { preHandler: requireAuth }, async (req) => {
    const me = req.user.sub;
    const count = await prisma.teamPost.count({ where: toActWhere(req.user) });
    return { count };
  });
}
