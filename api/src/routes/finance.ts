import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { audit } from '../audit.js';

// Chiffre d'affaires + caisse : réservés aux ADMIN, et protégés par une 2e saisie du code.
// POST /finance/unlock vérifie le PIN de l'admin connecté et renvoie un jeton "finance"
// valable FINANCE_TTL_MIN minutes. Toutes les routes /finance/* exigent ce jeton
// (header x-finance-token) EN PLUS du JWT de session : une session ouverte laissée
// sans surveillance n'expose donc pas les chiffres.
const FINANCE_TTL_MIN = 5;

type FinanceClaims = { sub: string; scope: 'finance' };

function requireFinanceToken(app: FastifyInstance) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const raw = req.headers['x-finance-token'];
    try {
      const claims = app.jwt.verify<FinanceClaims>(String(raw ?? ''));
      if (claims.scope !== 'finance' || claims.sub !== req.user.sub) throw new Error('bad_scope');
    } catch {
      return reply.code(403).send({ error: 'finance_locked' });
    }
  };
}

const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const net = (o: { totalAmount: number; discountAmount: number }) => o.totalAmount - o.discountAmount;

export default async function financeRoutes(app: FastifyInstance) {
  const admin = [requireAuth, requireRole('ADMIN')];

  app.post('/finance/unlock', { preHandler: admin }, async (req, reply) => {
    const { pin } = z.object({ pin: z.string().regex(/^\d{4,6}$/) }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user || !user.isActive) return reply.code(404).send({ error: 'user_not_found' });
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return reply.code(423).send({ error: 'locked', until: user.lockedUntil });
    }
    const ok = user.pinSet && (await bcrypt.compare(pin, user.pinHash));
    if (!ok) {
      // Même compteur que la connexion : 5 essais ratés = verrouillage 30 min.
      const failed = user.failedAttempts + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: failed, lockedUntil: failed >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : undefined },
      });
      await audit({ userId: user.id, action: 'FINANCE_UNLOCK_FAILED', entityType: 'User', entityId: user.id, ipAddress: req.ip });
      return reply.code(401).send({ error: 'bad_pin', attemptsLeft: Math.max(0, 5 - failed) });
    }
    await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null } });
    const token = app.jwt.sign({ sub: user.id, scope: 'finance' } as any, { expiresIn: `${FINANCE_TTL_MIN}m` });
    await audit({ userId: user.id, action: 'FINANCE_UNLOCKED', entityType: 'User', entityId: user.id, ipAddress: req.ip });
    return { token, expiresInSec: FINANCE_TTL_MIN * 60 };
  });

  app.get('/finance/summary', { preHandler: [...admin, requireFinanceToken(app)] }, async (req) => {
    const today = startOfDay();
    const tomorrow = addDays(today, 1);
    const weekStart = addDays(today, -6);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Encaissements (argent réellement reçu)
    const payments = await prisma.payment.findMany({
      where: { createdAt: { gte: monthStart < weekStart ? monthStart : weekStart } },
      include: {
        order: { select: { id: true, ticketCode: true, customer: { select: { fullName: true } } } },
        receivedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const sum = (rows: { amount: number }[]) => rows.reduce((a, p) => a + p.amount, 0);
    const todayPayments = payments.filter((p) => p.createdAt >= today);
    const byMethod: Record<string, number> = {};
    for (const p of todayPayments) byMethod[p.method] = (byMethod[p.method] ?? 0) + p.amount;

    // Chiffre d'affaires = montant facturé (net de remise) des commandes non annulées, par date de création
    const orders = await prisma.order.findMany({
      where: { deletedAt: null, status: { not: 'ANNULEE' }, createdAt: { gte: monthStart < weekStart ? monthStart : weekStart } },
      select: { totalAmount: true, discountAmount: true, createdAt: true },
    });
    const revenue = (from: Date) => orders.filter((o) => o.createdAt >= from).reduce((a, o) => a + net(o), 0);

    // 7 derniers jours (série pour le mini-graphique)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      const next = addDays(d, 1);
      return {
        date: d.toISOString().slice(0, 10),
        revenue: orders.filter((o) => o.createdAt >= d && o.createdAt < next).reduce((a, o) => a + net(o), 0),
        cash: sum(payments.filter((p) => p.createdAt >= d && p.createdAt < next)),
      };
    });

    // Impayés : reste à encaisser sur toutes les commandes non annulées
    const open = await prisma.order.findMany({
      where: { deletedAt: null, status: { not: 'ANNULEE' }, paymentStatus: { not: 'PAYE' } },
      select: {
        id: true, ticketCode: true, totalAmount: true, discountAmount: true, paidAmount: true, status: true,
        deliveryDate: true, customer: { select: { fullName: true, phone: true } },
      },
      orderBy: { deliveryDate: 'asc' },
    });
    const unpaid = open
      .map((o) => ({ ...o, due: net(o) - o.paidAmount }))
      .filter((o) => o.due > 0.0005);

    return {
      generatedAt: new Date().toISOString(),
      today: { cash: sum(todayPayments), revenue: revenue(today), byMethod, payments: todayPayments, count: todayPayments.length },
      week: { cash: sum(payments.filter((p) => p.createdAt >= weekStart)), revenue: revenue(weekStart) },
      month: { cash: sum(payments.filter((p) => p.createdAt >= monthStart)), revenue: revenue(monthStart) },
      days,
      unpaid: { total: unpaid.reduce((a, o) => a + o.due, 0), count: unpaid.length, orders: unpaid.slice(0, 15) },
    };
  });
}
