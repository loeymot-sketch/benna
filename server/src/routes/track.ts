import type { FastifyInstance } from 'fastify';
import QRCode from 'qrcode';
import { z } from 'zod';
import { prisma } from '../db.js';
import { emit } from '../events.js';

export default async function trackRoutes(app: FastifyInstance) {
  // Public order tracking by ticketCode — no auth, minimal data
  app.get('/track/:code', async (req, reply) => {
    const { code } = req.params as { code: string };
    const order = await prisma.order.findUnique({
      where: { ticketCode: code.toUpperCase() },
      include: {
        customer: { select: { fullName: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order || order.deletedAt) return reply.code(404).send({ error: 'not_found' });

    const dueAmount = order.totalAmount - order.discountAmount - order.paidAmount;
    return {
      ticketCode: order.ticketCode,
      customerFirstName: order.customer.fullName.trim().split(' ')[0] ?? '',
      plannedFor: order.plannedFor,
      plannedNote: order.plannedNote,
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      paidAmount: order.paidAmount,
      notifyMode: order.notifyMode,
      hasPhone: !!(order.customer.phone || order.notifyPhone),
      status: order.status,
      urgency: order.urgency,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryTime,
      remainingAmount: Math.max(0, dueAmount),
      timeline: order.statusHistory.map((h) => ({
        toStatus: h.toStatus,
        at: h.createdAt,
      })),
    };
  });

  // Le client choisit sur la page de suivi comment être prévenu quand c'est prêt (public, par code ticket)
  app.post('/track/:code/notify', async (req, reply) => {
    const { code } = req.params as { code: string };
    const Body = z.object({
      mode: z.enum(['NONE', 'CALL', 'WHATSAPP']),
      phone: z.string().max(30).optional().nullable(),
    });
    const { mode, phone } = Body.parse(req.body);
    const order = await prisma.order.findUnique({ where: { ticketCode: code.toUpperCase() }, include: { customer: true } });
    if (!order || order.deletedAt) return reply.code(404).send({ error: 'not_found' });
    const digits = (phone ?? '').replace(/\D/g, '');
    let notifyPhone = order.notifyPhone;
    if (digits.length >= 8) notifyPhone = digits.startsWith('216') ? `+${digits}` : digits.length === 8 ? `+216${digits}` : `+${digits}`;
    if (mode !== 'NONE' && !order.customer.phone && !notifyPhone) return reply.code(400).send({ error: 'phone_required' });
    await prisma.order.update({
      where: { id: order.id },
      data: { notifyMode: mode, notifyPhone, notifyRequestedAt: mode === 'NONE' ? null : new Date() },
    });
    await emit('order.updated', { id: order.id });
    return { ok: true, notifyMode: mode };
  });

  // QR PNG for an order
  app.get('/track/:code/qr.png', async (req, reply) => {
    const { code } = req.params as { code: string };
    const url = `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173'}/track/${code.toUpperCase()}`;
    const png = await QRCode.toBuffer(url, { type: 'png', margin: 1, width: 320 });
    reply.type('image/png');
    return png;
  });
}
