import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';
import { audit } from '../audit.js';

// Le GSM est facultatif : chaîne vide ou absente = pas de numéro.
// Un numéro saisi mais incomplet est refusé (invalid_phone) plutôt que jeté en silence.
const PhoneSchema = z.string().max(30).optional().nullable()
  .refine((v) => { const n = (v ?? '').replace(/\D/g, '').length; return n === 0 || n >= 8; }, 'invalid_phone')
  .transform((v) => ((v ?? '').replace(/\D/g, '').length >= 8 ? v! : null));

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('216')) return `+${digits}`;
  if (digits.length === 8) return `+216${digits}`;
  return `+${digits}`;
}

export default async function customersRoutes(app: FastifyInstance) {
  app.get('/customers', { preHandler: requireAuth }, async (req) => {
    const Q = z.object({ q: z.string().optional(), limit: z.coerce.number().max(100).default(50) });
    const { q, limit } = Q.parse((req as any).query);
    const where = q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' as const } },
            { phone: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { _count: { select: { orders: true } } },
    });
    return { customers };
  });

  app.get('/customers/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 100,
          select: {
            id: true, ticketCode: true, status: true, urgency: true,
            totalAmount: true, paidAmount: true, deliveryDate: true, createdAt: true,
          },
        },
      },
    });
    if (!customer) return reply.code(404).send({ error: 'not_found' });
    return { customer };
  });

  app.post('/customers', { preHandler: requireAuth }, async (req, reply) => {
    const Body = z.object({
      fullName: z.string().optional().default(''),
      phone: PhoneSchema,
      email: z.string().email().optional().nullable().or(z.literal('').transform(() => null)),
      notes: z.string().optional().nullable(),
      tags: z.array(z.string()).optional().default([]),
    });
    const data = Body.parse(req.body);
    const phone = data.phone ? normalizePhone(data.phone) : null;
    const existing = phone ? await prisma.customer.findUnique({ where: { phone } }) : null;
    if (existing) return reply.code(409).send({ error: 'phone_exists', customer: existing });
    const customer = await prisma.customer.create({
      data: {
        fullName: data.fullName.trim(),
        phone,
        email: data.email ?? null,
        notes: data.notes ?? null,
        tags: JSON.stringify(data.tags ?? []),
      },
    });
    await audit({ userId: req.user.sub, action: 'CUSTOMER_CREATED', entityType: 'Customer', entityId: customer.id, payload: customer });
    return { customer };
  });

  // Modifier la fiche client (nom, GSM, email, notes). orderId : pour tracer la modification dans l'historique de la commande.
  app.patch('/customers/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({
      fullName: z.string().optional(),
      phone: PhoneSchema,
      email: z.string().email().optional().nullable().or(z.literal('').transform(() => null)),
      notes: z.string().optional().nullable(),
      orderId: z.string().optional(),
    });
    const raw = (req.body ?? {}) as Record<string, unknown>;
    const data = Body.parse(raw);
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'not_found' });
    const update: Record<string, unknown> = {};
    if (data.fullName !== undefined) update.fullName = data.fullName.trim();
    if ('phone' in raw) {
      const phone = data.phone ? normalizePhone(data.phone) : null;
      if (phone && phone !== existing.phone) {
        const other = await prisma.customer.findUnique({ where: { phone } });
        if (other && other.id !== id) return reply.code(409).send({ error: 'phone_exists', customer: other });
      }
      update.phone = phone;
    }
    if ('email' in raw) update.email = data.email ?? null;
    if ('notes' in raw) update.notes = data.notes ?? null;
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [k, v] of Object.entries(update)) {
      if (((existing as any)[k] ?? null) !== (v ?? null)) changes[k] = { from: (existing as any)[k] ?? null, to: v ?? null };
    }
    const customer = await prisma.customer.update({ where: { id }, data: update });
    if (Object.keys(changes).length > 0) {
      await audit({ userId: req.user.sub, action: 'CUSTOMER_UPDATED', entityType: 'Customer', entityId: id, payload: { changes } });
      if (data.orderId) await audit({ userId: req.user.sub, action: 'CUSTOMER_UPDATED', entityType: 'Order', entityId: data.orderId, payload: { changes } });
    }
    return { customer };
  });

  // Find or auto-create — used by order creation flow
  app.post('/customers/lookup-or-create', { preHandler: requireAuth }, async (req) => {
    const Body = z.object({
      fullName: z.string().optional().default(''),
      phone: PhoneSchema,
      email: z.string().email().optional().nullable().or(z.literal('').transform(() => null)),
    });
    const data = Body.parse(req.body);
    const name = data.fullName.trim();
    const phone = data.phone ? normalizePhone(data.phone) : null;
    // Avec GSM : on retrouve le client existant. Sans GSM : nouvelle fiche (client de passage).
    let c = phone ? await prisma.customer.findUnique({ where: { phone } }) : null;
    if (c && !c.fullName && name) c = await prisma.customer.update({ where: { id: c.id }, data: { fullName: name } });
    if (!c) {
      try {
        c = await prisma.customer.create({
          data: { fullName: name, phone, email: data.email ?? null, tags: '[]' },
        });
      } catch (e: any) {
        // double clic / deux postes en même temps avec le même GSM : on relit la fiche créée par l'autre requête
        if (e?.code === 'P2002' && phone) c = await prisma.customer.findUnique({ where: { phone } });
        else throw e;
      }
      if (!c) throw new Error('customer_create_failed');
      await audit({ userId: req.user.sub, action: 'CUSTOMER_CREATED', entityType: 'Customer', entityId: c.id });
    }
    return { customer: c };
  });
}
