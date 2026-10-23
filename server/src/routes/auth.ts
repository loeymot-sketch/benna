import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { audit } from '../audit.js';

export default async function authRoutes(app: FastifyInstance) {
  // Public: list users for the login picker (no PIN, just enough to render avatars)
  app.get('/auth/users', async () => {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ role: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true, firstName: true, lastName: true, avatar: true,
        role: true, shopId: true, pinSet: true, mustChangePin: true,
      },
    });
    return { users };
  });

  // Login with PIN
  app.post('/auth/login', async (req, reply) => {
    const Body = z.object({ userId: z.string(), pin: z.string().min(4).max(6) });
    const { userId, pin } = Body.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) return reply.code(404).send({ error: 'user_not_found' });
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return reply.code(423).send({ error: 'locked', until: user.lockedUntil });
    }
    if (!user.pinSet) return reply.code(409).send({ error: 'pin_not_set' });
    const ok = await bcrypt.compare(pin, user.pinHash);
    if (!ok) {
      const failed = user.failedAttempts + 1;
      const lock = failed >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
      await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: failed, lockedUntil: lock ?? undefined },
      });
      return reply.code(401).send({ error: 'bad_pin', attemptsLeft: Math.max(0, 5 - failed) });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
    const token = app.jwt.sign(
      { sub: user.id, role: user.role, shopId: user.shopId, firstName: user.firstName, lastName: user.lastName },
      { expiresIn: '30d' }, // Session longue : on reste connecté toute la journée (et plus)
    );
    await audit({
      userId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id,
      ipAddress: req.ip, userAgent: req.headers['user-agent'] ?? undefined,
    });
    return { token, user: {
      id: user.id, firstName: user.firstName, lastName: user.lastName,
      role: user.role, shopId: user.shopId, avatar: user.avatar,
      mustChangePin: user.mustChangePin,
    }};
  });

  // Set PIN on first login (or when admin reset it)
  app.post('/auth/setup-pin', async (req, reply) => {
    const Body = z.object({ userId: z.string(), pin: z.string().regex(/^\d{4,6}$/) });
    const { userId, pin } = Body.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) return reply.code(404).send({ error: 'user_not_found' });
    if (user.pinSet) return reply.code(409).send({ error: 'pin_already_set' });
    const expected = user.role === 'ADMIN' ? 6 : 4;
    if (pin.length !== expected) return reply.code(400).send({ error: 'pin_length', expected });
    const pinHash = await bcrypt.hash(pin, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { pinHash, pinSet: true, failedAttempts: 0, lockedUntil: null },
    });
    await audit({
      userId: user.id, action: 'PIN_SET', entityType: 'User', entityId: user.id,
      ipAddress: req.ip,
    });
    return { ok: true };
  });

  // Quick switch — same as login but doesn't reset; just returns a fresh token
  app.post('/auth/logout', async (req, reply) => {
    return { ok: true };
  });
}
