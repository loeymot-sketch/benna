import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, requireRole, generateTicketCode } from '../auth.js';
import { audit } from '../audit.js';
import { emit } from '../events.js';
import { fileUrl } from '../storage.js';
import { signFile } from './uploads.js';
import crypto from 'node:crypto';
import QRCode from 'qrcode';

const Statuses = ['RECUE','EN_ATTENTE','EN_COURS_DESIGN','VALIDATION_CLIENT','EN_PRODUCTION','EN_FINITION','PRETE','LIVREE','ANNULEE'] as const;
const Urgencies = ['NORMAL','PRIORITAIRE','URGENT','EXPRESS'] as const;
const DateStr = z.string().refine((v) => !isNaN(new Date(v).getTime()), 'invalid_date');
const NotifyModes = ['NONE','CALL','WHATSAPP'] as const;
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
      toNotify: z.string().optional(), // « 1 » : commandes prêtes dont le client attend d'être prévenu
      limit: z.coerce.number().max(200).default(100),
    });
    const f = Q.parse((req as any).query);
    const where: any = { deletedAt: null };
    if (f.status) where.status = { in: f.status.split(',') };
    if (f.urgency) where.urgency = f.urgency;
    if (f.shopId) where.shopId = f.shopId;
    if (f.assignedToId) where.assignedToId = f.assignedToId;
    if (f.mine) where.assignedToId = req.user.sub;
    if (f.toNotify === '1') { where.status = 'PRETE'; where.notifyMode = { not: 'NONE' }; where.notifiedAt = null; }
    if (f.q) {
      where.OR = [
        { ticketCode: { contains: f.q, mode: 'insensitive' as const } },
        { description: { contains: f.q, mode: 'insensitive' as const } },
        { pouchNumber: { contains: f.q, mode: 'insensitive' as const } },
        { customer: { fullName: { contains: f.q, mode: 'insensitive' as const } } },
        { customer: { phone: { contains: f.q, mode: 'insensitive' as const } } },
        { notifyPhone: { contains: f.q, mode: 'insensitive' as const } },
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
    // Le secret du lien de suivi ne sort que par /orders/:id/qr (le personnel de production n'a pas à le connaître).
    return { orders: orders.map(({ trackKey: _k, ...o }) => o) };
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
    // Liens d'accès (signés, temporaires) pour les pièces jointes
    const attachments = await Promise.all(order.attachments.map(async (a) => ({ ...a, url: await fileUrl(a.path, (k) => signFile(app, k)) })));
    // Journal des modifications (prix, remise, paiements corrigés…) pour l'onglet Historique
    const logs = await prisma.auditLog.findMany({
      where: { entityType: 'Order', entityId: id, action: { in: ['ORDER_UPDATED', 'PAYMENT_RECORDED', 'PAYMENT_UPDATED', 'PAYMENT_DELETED', 'CUSTOMER_UPDATED'] } },
      orderBy: { createdAt: 'desc' }, take: 100,
      include: { user: { select: { firstName: true, lastName: true, role: true } } },
    });
    const changes = logs.map((l) => ({ id: l.id, action: l.action, createdAt: l.createdAt, user: l.user, payload: l.payload ? JSON.parse(l.payload) : null }));
    const { trackKey: _k, ...safe } = order;
    return { order: { ...safe, attachments, changes } };
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
      deliveryDate: DateStr,
      deliveryTime: z.string().optional().nullable(),
      internalNotes: z.string().optional().nullable(),
      assignedToId: z.string().optional().nullable(),
      notifyMode: z.enum(NotifyModes).optional(),
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
        trackKey: crypto.randomBytes(8).toString('hex'),
        notifyMode: data.notifyMode ?? 'NONE',
        notifyRequestedAt: data.notifyMode && data.notifyMode !== 'NONE' ? new Date() : null,
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

    await emit('order.created', { id: order.id, ticketCode: order.ticketCode });
    return { order };
  });

  app.patch('/orders/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({
      description: z.string().optional(),
      totalAmount: z.number().nonnegative().optional(),
      discountAmount: z.number().nonnegative().optional(),
      urgency: z.enum(Urgencies).optional(),
      deliveryDate: DateStr.optional(),
      deliveryTime: z.string().nullable().optional(),
      internalNotes: z.string().nullable().optional(),
      assignedToId: z.string().nullable().optional(),
      pouchNumber: z.string().nullable().optional(),
      productionSubStatus: z.string().nullable().optional(),
      plannedFor: DateStr.nullable().optional(),
      plannedNote: z.string().nullable().optional(),
      notifyMode: z.enum(NotifyModes).optional(),
      notifyPhone: z.string().nullable().optional(),
      serviceIds: z.array(z.string()).optional(),
    });
    const data = Body.parse(req.body);
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'not_found' });

    const updateData: any = { ...data };
    if (data.deliveryDate) updateData.deliveryDate = new Date(data.deliveryDate);
    if (data.notifyPhone !== undefined) {
      const d = (data.notifyPhone ?? '').replace(/\D/g, '');
      if (d.length > 0 && d.length < 8) return reply.code(400).send({ error: 'invalid_phone' });
      updateData.notifyPhone = d.length < 8 ? null : d.startsWith('216') ? `+${d}` : d.length === 8 ? `+216${d}` : `+${d}`;
    }
    if (data.plannedFor !== undefined) updateData.plannedFor = data.plannedFor ? new Date(data.plannedFor) : null;
    if (data.notifyMode !== undefined) updateData.notifyRequestedAt = data.notifyMode === 'NONE' ? null : new Date();
    if (data.totalAmount !== undefined || data.discountAmount !== undefined) {
      const total = data.totalAmount ?? existing.totalAmount;
      const discount = data.discountAmount ?? existing.discountAmount;
      if (discount > total) return reply.code(400).send({ error: 'discount_exceeds_total' });
      updateData.paymentStatus = computePaymentStatus(total, existing.paidAmount, discount);
    }
    delete updateData.serviceIds;

    // Ce qui change réellement (avant → après), pour l'historique des modifications
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const norm = (v: unknown) => (v instanceof Date ? v.toISOString() : v ?? null);
    for (const [k, v] of Object.entries(updateData)) {
      if (k === 'paymentStatus' || k === 'notifyRequestedAt') continue;
      const before = norm((existing as any)[k]);
      const after = norm(v);
      if (JSON.stringify(before) !== JSON.stringify(after)) changes[k] = { from: before, to: after };
    }
    if (data.serviceIds) {
      const prev = await prisma.serviceOnOrder.findMany({ where: { orderId: id }, include: { service: { select: { name: true } } } });
      const next = await prisma.service.findMany({ where: { id: { in: data.serviceIds } }, select: { name: true } });
      const a = prev.map((p) => p.service.name).sort();
      const b = next.map((n) => n.name).sort();
      if (JSON.stringify(a) !== JSON.stringify(b)) changes.services = { from: a, to: b };
    }

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

    if (Object.keys(changes).length > 0) {
      await audit({
        userId: req.user.sub, action: 'ORDER_UPDATED',
        entityType: 'Order', entityId: id, payload: { changes },
      });
    }
    await emit('order.updated', { id });
    return { order };
  });

  app.post('/orders/:id/status', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({
      status: z.enum(Statuses), comment: z.string().optional(),
      plannedFor: DateStr.nullable().optional(), // « prévu pour » la nouvelle étape
      plannedNote: z.string().nullable().optional(),
    });
    const { status, comment, plannedFor, plannedNote } = Body.parse(req.body);
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'not_found' });
    if (existing.status === status && plannedFor === undefined && plannedNote === undefined) return { order: existing };
    const order = await prisma.$transaction(async (tx) => {
      if (existing.status === status) {
        // même étape : on met seulement à jour la date prévue
        return tx.order.update({ where: { id }, data: {
          plannedFor: plannedFor ? new Date(plannedFor) : null, plannedNote: plannedNote ?? null,
        }, include: { customer: true } });
      }
      await tx.orderStatusHistory.create({
        data: {
          orderId: id, fromStatus: existing.status, toStatus: status,
          changedById: req.user.sub, comment: comment ?? null,
        },
      });
      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          plannedFor: plannedFor ? new Date(plannedFor) : null, // une nouvelle étape repart sans date annoncée
          plannedNote: plannedNote ?? null,
        },
        include: { customer: true },
      });
      // Client qui veut être prévenu : on garde une trace « à envoyer » (WhatsApp automatique plus tard).
      if (status === 'PRETE' && existing.notifyMode !== 'NONE') {
        const recipient = existing.notifyPhone ?? updated.customer.phone ?? '';
        // Pas de doublon (PRETE → autre → PRETE) et pas de notification sans destinataire.
        const already = await tx.notification.count({ where: { orderId: id, status: 'PENDING' } });
        // Retour en « Prête » après un client déjà prévenu : il faut le prévenir de nouveau.
        if (recipient && !already && existing.notifiedAt) await tx.order.update({ where: { id }, data: { notifiedAt: null } });
        if (recipient && !already) await tx.notification.create({ data: {
          orderId: id, channel: existing.notifyMode, recipient,
          message: `Votre commande ${existing.ticketCode} est prête.`, status: 'PENDING',
        } });
      }
      return updated;
    });
    await audit({
      userId: req.user.sub, action: 'ORDER_STATUS_CHANGED',
      entityType: 'Order', entityId: id, payload: { from: existing.status, to: status },
    });
    await emit('order.status_changed', { id, from: existing.status, to: status });
    return { order };
  });

  // Lien de suivi complet (avec le secret) + QR, réservé à l'équipe. Crée le secret des anciennes commandes à la demande.
  app.get('/orders/:id/qr', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const { base } = (req.query ?? {}) as { base?: string };
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.deletedAt) return reply.code(404).send({ error: 'not_found' });
    let trackKey = order.trackKey;
    if (!trackKey) {
      // deux appels simultanés ne doivent pas produire deux secrets : seul le premier écrit, l'autre relit.
      await prisma.order.updateMany({ where: { id, trackKey: null }, data: { trackKey: crypto.randomBytes(8).toString('hex') } });
      trackKey = (await prisma.order.findUnique({ where: { id }, select: { trackKey: true } }))!.trackKey!;
    }
    const origin = (/^https?:\/\/[^/\s]+$/.test(base ?? '') ? base! : (process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173')).replace(/\/+$/, '');
    const url = `${origin}/track/${encodeURIComponent(order.ticketCode)}?k=${trackKey}`;
    const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 360 });
    return { url, dataUrl };
  });

  // L'équipe a prévenu le client (appel passé / message envoyé)
  app.post('/orders/:id/notified', { preHandler: [requireAuth, requireRole('ADMIN', 'MANAGER', 'RECEPTION')] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const Body = z.object({ done: z.boolean().default(true) });
    const { done } = Body.parse(req.body ?? {});
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: 'not_found' });
    if (done && existing.status !== 'PRETE') return reply.code(409).send({ error: 'not_ready' });
    const order = await prisma.order.update({ where: { id }, data: { notifiedAt: done ? new Date() : null } });
    if (done) await prisma.notification.updateMany({ where: { orderId: id, status: 'PENDING' }, data: { status: 'SENT', sentAt: new Date() } });
    await audit({ userId: req.user.sub, action: 'ORDER_CLIENT_NOTIFIED', entityType: 'Order', entityId: id, payload: { done } });
    await emit('order.updated', { id });
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
    await emit('order.updated', { id });
    return { order: order.updated, payment: order.payment };
  });

  // Corriger un paiement mal saisi (montant ou mode) — réservé aux responsables
  app.patch('/orders/:id/payments/:paymentId', { preHandler: [requireAuth, requireRole('ADMIN', 'MANAGER')] }, async (req, reply) => {
    const { id, paymentId } = req.params as { id: string; paymentId: string };
    const Body = z.object({
      amount: z.number().positive().optional(),
      method: z.enum(PaymentMethods).optional(),
    });
    const data = Body.parse(req.body);
    const existing = await prisma.order.findUnique({ where: { id } });
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!existing || !payment || payment.orderId !== id) return reply.code(404).send({ error: 'not_found' });
    const amount = data.amount ?? payment.amount;
    const method = data.method ?? payment.method;
    const order = await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: paymentId }, data: { amount, method } });
      const newPaid = Math.max(0, existing.paidAmount - payment.amount + amount);
      return tx.order.update({
        where: { id },
        data: { paidAmount: newPaid, paymentStatus: computePaymentStatus(existing.totalAmount, newPaid, existing.discountAmount) },
      });
    });
    await audit({
      userId: req.user.sub, action: 'PAYMENT_UPDATED', entityType: 'Order', entityId: id,
      payload: { paymentId, from: { amount: payment.amount, method: payment.method }, to: { amount, method } },
    });
    await emit('order.updated', { id });
    return { order };
  });

  // Supprimer un paiement saisi par erreur — réservé aux responsables
  app.delete('/orders/:id/payments/:paymentId', { preHandler: [requireAuth, requireRole('ADMIN', 'MANAGER')] }, async (req, reply) => {
    const { id, paymentId } = req.params as { id: string; paymentId: string };
    const existing = await prisma.order.findUnique({ where: { id } });
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!existing || !payment || payment.orderId !== id) return reply.code(404).send({ error: 'not_found' });
    const order = await prisma.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id: paymentId } });
      const newPaid = Math.max(0, existing.paidAmount - payment.amount);
      return tx.order.update({
        where: { id },
        data: { paidAmount: newPaid, paymentStatus: computePaymentStatus(existing.totalAmount, newPaid, existing.discountAmount) },
      });
    });
    await audit({
      userId: req.user.sub, action: 'PAYMENT_DELETED', entityType: 'Order', entityId: id,
      payload: { paymentId, amount: payment.amount, method: payment.method, createdAt: payment.createdAt },
    });
    await emit('order.updated', { id });
    return { order };
  });

  app.delete('/orders/:id', { preHandler: [requireAuth, requireRole('ADMIN', 'MANAGER')] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!['ADMIN'].includes(req.user.role)) return reply.code(403).send({ error: 'forbidden' });
    await prisma.order.update({ where: { id }, data: { deletedAt: new Date() } });
    await audit({
      userId: req.user.sub, action: 'ORDER_DELETED',
      entityType: 'Order', entityId: id,
    });
    await emit('order.deleted', { id });
    return { ok: true };
  });

  // Dashboard counters
  app.get('/dashboard', { preHandler: requireAuth }, async () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const tomorrow = new Date(start); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(start); dayAfter.setDate(dayAfter.getDate() + 2);

    const [urgent, dueToday, dueTomorrow, late, openCount, statusBreakdown, toNotify] = await Promise.all([
      prisma.order.count({ where: { deletedAt: null, urgency: { in: ['URGENT','EXPRESS'] }, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.count({ where: { deletedAt: null, deliveryDate: { gte: start, lt: tomorrow }, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.count({ where: { deletedAt: null, deliveryDate: { gte: tomorrow, lt: dayAfter }, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.count({ where: { deletedAt: null, deliveryDate: { lt: start }, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.count({ where: { deletedAt: null, status: { notIn: ['LIVREE','ANNULEE'] } } }),
      prisma.order.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
      prisma.order.count({ where: { deletedAt: null, status: 'PRETE', notifyMode: { not: 'NONE' }, notifiedAt: null } }),
    ]);

    return {
      counters: {
        urgent, dueToday, dueTomorrow, late, openCount, toNotify,
      },
      statusBreakdown,
    };
  });
}
