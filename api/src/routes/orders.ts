import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole, generateTicketCode } from '../auth.js';
import { audit } from '../audit.js';
import { emit } from '../io.js';

const Statuses = ['RECUE','EN_ATTENTE','EN_COURS_DESIGN','VALIDATION_CLIENT','EN_PRODUCTION','EN_FINITION','PRETE','LIVREE','ANNULEE'] as const;
const Urgencies = ['NORMAL','PRIORITAIRE','URGENT','EXPRESS'] as const;
const PaymentStatuses = ['IMPAYE','ACOMPTE','PAYE'] as const;
const PaymentMethods = ['ESPECES','CARTE','VIREMENT','CHEQUE','D17','EDINAR','AUTRE'] as const;

function computePaymentStatus(total: number, paid: number, discount: number): typeof PaymentStatuses[number] {
  const due = total - discount;
  if (paid <= 0) return 'IMPAYE';
  if (paid >= due) return 'PAYE';
  return 'ACOMPTE';
}

export default async function ordersRoutes(app: FastifyInstance) {
  // List with filters
  app.get('/orders', { preHandler: requireAuth }, async (req) => {
    const Q = z.object({
      status: z.string().optional(),
      urgency: z.string().optional(),
      shopId: z.string().optional(),
      assignedToId: z.string().optional(),
      q: z.string().optional(),
      mine: z.coerce.boolean().optional(),
      limit: z.coerce.number().max(200).default(100),
    });
    const f = Q.parse((req as any).query);
    const where: any = { deletedAt: null };
    if (f.status) where.status = { in: f.status.split(',') };
    if (f.urgency) where.urgency = f.urgency;
    if (f.shopId) where.shopId = f.shopId;
    if (f.assignedToId) where.assignedToId = f.assignedToId;
    if (f.mine) where.assignedToId = req.user.sub;
    if (f.q) {
      where.OR = [
        { ticketCode: { contains: f.q } },
        { description: { contains: f.q } },
        { pouchNumber: { contains: f.q } },
        { customer: { fullName: { contains: f.q } } },
        { customer: { phone: { contains: f.q } } },
      ];
    }
    const orders = await prisma.order.findMany({
      where, take: f.limit, orderBy: [{ urgency: 'desc' }, { deliveryDate: 'asc' }],
      include: {
        customer: true, shop: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        services: { include: { service: true } },
      },
    });
    return { orders };
  });

  app.get('/orders/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true, shop: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        services: { include: { service: true } },
        lineItems: true,
        attachments: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' }, include: { receivedBy: { select: { firstName: true, lastName: true } } } },
        statusHistory: { orderBy: { createdAt: 'desc' }, include: { changedBy: { select: { firstName: true, lastName: true } } } },
        posts: {
          where: { parentId: null },
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            recipientUser: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!order || order.deletedAt) return reply.code(404).send({ error: 'not_found' });
    return { order };
  });

  app.post('/orders', { preHandler: requireAuth }, async (req) => {
    const Body = z.object({
      shopId: z.string(),
      customerId: z.string(),
      pouchNumber: z.string().optional().nullable(),
      description: z.string().min(1),
      totalAmount: z.number().nonnegative(),
      paidAmount: z.number().nonnegative().default(0),
      discountAmount: z.number().nonnegative().default(0),
      urgency: z.enum(Urgencies).default('NORMAL'),
      deliveryDate: z.string(),
      deliveryTime: z.string().optional().nullable(),
      internalNotes: z.string().optional().nullable(),
      assignedToId: z.string().optional().nullable(),
      serviceIds: z.array(z.string()).default([]),
      lineItems: z.array(z.object({
        catalogItemId: z.string().optional().nullable(),
        description: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
      })).default([]),
      paymentMethod: z.enum(PaymentMethods).optional(),
    });
    const data = Body.parse(req.body);

    // Generate ticket code
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const last = await prisma.order.findFirst({
      where: { ticketCode: { startsWith: `LB-${yearMonth}-` } },
      orderBy: { createdAt: 'desc' },
      select: { ticketCode: true },
    });
    const seq = last ? parseInt(last.ticketCode.split('-')[2], 10) + 1 : 1;
    const ticketCode = generateTicketCode(seq);

    const paymentStatus = computePaymentStatus(data.totalAmount, data.paidAmount, data.discountAmount);

    const order = await prisma.order.create({
      data: {
        ticketCode,
        pouchNumber: data.pouchNumber ?? null,
        shopId: data.shopId,
        customerId: data.customerId,
        description: data.description,
        totalAmount: data.totalAmount,
        paidAmount: data.paidAmount,
        discountAmount: data.discountAmount,
        paymentStatus,
        urgency: data.urgency,
        status: 'RECUE',
        deliveryDate: new Date(data.deliveryDate),
        deliveryTime: data.deliveryTime ?? null,
        internalNotes: data.internalNotes ?? null,
        createdById: req.user.sub,
        assignedToId: data.assignedToId ?? null,
        services: { create: data.serviceIds.map((sid) => ({ serviceId: sid })) },
        lineItems: { create: data.lineItems.map((li) => ({
          catalogItemId: li.catalogItemId ?? null,
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          total: li.quantity * li.unitPrice,
        })) },
        statusHistory: { create: { toStatus: 'RECUE', changedById: req.user.sub, comment: 'Création' } },
        ...(data.paidAmount > 0 && data.paymentMethod
          ? { payments: { create: {
              amount: data.paidAmount,
              method: data.paymentMethod,
              receivedById: req.user.sub,
            }}}
          : {}),
      },
      include: { customer: true, shop: true },
    });

    await audit({
      userId: req.user.sub, action: 'ORDER_CREATED',
      entityType: 'Order', entityId: order.id, payload: { ticketCode },
    });

    emit('order.created', { id: order.id, ticketCode: order.ticketCode });
    return { order };
  });

  app.patch('/orders/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({
      description: z.string().optional(),
      totalAmount: z.number().nonnegative().optional(),
      discountAmount: z.number().nonnegative().optional(),
      urgency: z.enum(Urgencies).optional(),
      deliveryDate: z.string().optional(),
      deliveryTime: z.string().nullable().optional(),
      internalNotes: z.string().nullable().optional(),
      assignedToId: z.string().nullable().optional(),
      pouchNumber: z.string().nullable().optional(),
      productionSubStatus: z.string().nullable().optional(),
      serviceIds: z.array(z.string()).optional(),
    });
    const data = Body.parse(req.body);
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'not_found' });

    const updateData: any = { ...data };
    if (data.deliveryDate) updateData.deliveryDate = new Date(data.deliveryDate);
    if (data.totalAmount !== undefined || data.discountAmount !== undefined) {
      const total = data.totalAmount ?? existing.totalAmount;
      const discount = data.discountAmount ?? existing.discountAmount;
      updateData.paymentStatus = computePaymentStatus(total, existing.paidAmount, discount);
    }
    delete updateData.serviceIds;

    const order = await prisma.$transaction(async (tx) => {
      if (data.serviceIds) {
        await tx.serviceOnOrder.deleteMany({ where: { orderId: id } });
        await tx.serviceOnOrder.createMany({
          data: data.serviceIds.map((sid) => ({ orderId: id, serviceId: sid })),
        });
      }
      return tx.order.update({
        where: { id },
        data: updateData,
        include: { customer: true, shop: true },
      });
    });

    await audit({
      userId: req.user.sub, action: 'ORDER_UPDATED',
      entityType: 'Order', entityId: id, payload: data,
    });
    emit('order.updated', { id });
    return { order };
  });

  app.post('/orders/:id/status', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({ status: z.enum(Statuses), comment: z.string().optional() });
    const { status, comment } = Body.parse(req.body);
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'not_found' });
    if (existing.status === status) return { order: existing };
    const order = await prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({
        data: {
          orderId: id, fromStatus: existing.status, toStatus: status,
          changedById: req.user.sub, comment: comment ?? null,
        },
      });
      return tx.order.update({ where: { id }, data: { status }, include: { customer: true } });
    });
    await audit({
      userId: req.user.sub, action: 'ORDER_STATUS_CHANGED',
      entityType: 'Order', entityId: id, payload: { from: existing.status, to: status },
    });
    emit('order.status_changed', { id, from: existing.status, to: status });
    return { order };
  });

  app.post('/orders/:id/payments', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({
      amount: z.number().positive(),
      method: z.enum(PaymentMethods),
      reference: z.string().optional().nullable(),
    });
    const data = Body.parse(req.body);
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'not_found' });

    const order = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: id, amount: data.amount, method: data.method,
          reference: data.reference ?? null, receivedById: req.user.sub,
        },
      });
      const newPaid = existing.paidAmount + data.amount;
      const paymentStatus = computePaymentStatus(existing.totalAmount, newPaid, existing.discountAmount);
      const updated = await tx.order.update({
        where: { id },
        data: { paidAmount: newPaid, paymentStatus },
      });
      return { updated, payment };
    });

    await audit({
      userId: req.user.sub, action: 'PAYMENT_RECORDED',
      entityType: 'Order', entityId: id, payload: { amount: data.amount, method: data.method },
    });
    emit('order.updated', { id });
    return { order: order.updated, payment: order.payment };
  });

  app.delete('/orders/:id', { preHandler: [requireAuth, requireRole('ADMIN', 'MANAGER')] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!['ADMIN'].includes(req.user.role)) return reply.code(403).send({ error: 'forbidden' });
    await prisma.order.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit({
      userId: req.user.sub, action: 'ORDER_DELETED',
      entityType: 'Order', entityId: id,
    });
    emit('order.deleted', { id });
    return { ok: true };
  });

  // Dashboard counters
  app.get('/dashboard', { preHandler: requireAuth }, async () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const tomorrow = new Date(start); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(start); dayAfter.setDate(dayAfter.getDate() + 2);

    const [urgent, dueToday, dueTomorrow, late, openCount, statusBreakdown] = await Promise.all([
      prisma.order.count({ where: { deletedAt: null, urgency: { in: ['URGENT','EXPRESS'] }, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.count({ where: { deletedAt: null, deliveryDate: { gte: start, lt: tomorrow }, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.count({ where: { deletedAt: null, deliveryDate: { gte: tomorrow, lt: dayAfter }, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.count({ where: { deletedAt: null, deliveryDate: { lt: start }, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.count({ where: { deletedAt: null, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
    ]);

    return {
      counters: {
        urgent, dueToday, dueTomorrow, late, openCount,
      },
      statusBreakdown,
    };
  });
}
