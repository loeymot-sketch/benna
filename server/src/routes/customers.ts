import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../auth.js';
import { audit } from '../audit.js';

const PhoneSchema = z.string().min(8).max(20);

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
      fullName: z.string().min(1),
      phone: PhoneSchema,
      email: z.string().email().optional().nullable(),
      notes: z.string().optional().nullable(),
      tags: z.array(z.string()).optional().default([]),
    });
    const data = Body.parse(req.body);
    const phone = normalizePhone(data.phone);
    const existing = await prisma.customer.findUnique({ where: { phone } });
    if (existing) return reply.code(409).send({ error: 'phone_exists', customer: existing });
    const customer = await prisma.customer.create({
      data: {
        fullName: data.fullName,
        phone,
        email: data.email ?? null,
        notes: data.notes ?? null,
        tags: JSON.stringify(data.tags ?? []),
      },
    });
    await audit({ userId: req.user.sub, action: 'CUSTOMER_CREATED', entityType: 'Customer', entityId: customer.id, payload: customer });
    return { customer };
  });

  // Find or auto-create — used by order creation flow
  app.post('/customers/lookup-or-create', { preHandler: requireAuth }, async (req) => {
    const Body = z.object({
      fullName: z.string().min(1),
      phone: PhoneSchema,
      email: z.string().email().optional().nullable(),
    });
    const data = Body.parse(req.body);
    const phone = normalizePhone(data.phone);
    let c = await prisma.customer.findUnique({ where: { phone } });
    if (!c) {
      c = await prisma.customer.create({
        data: { fullName: data.fullName, phone, email: data.email ?? null, tags: '[]' },
      });
      await audit({ userId: req.user.sub, action: 'CUSTOMER_CREATED', entityType: 'Customer', entityId: c.id });
    }
    return { customer: c };
  });
}
