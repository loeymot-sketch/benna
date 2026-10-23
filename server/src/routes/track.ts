import type { FastifyInstance } from 'fastify';
import QRCode from 'qrcode';
import { prisma } from '../db.js';

export default async function trackRoutes(app: FastifyInstance) {
  // Public order tracking by ticketCode — no auth, minimal data
  app.get('/track/:code', async (req, reply) => {
    const { code } = req.params as { code: string };
    const order = await prisma.order.findUnique({
      where: { ticketCode: code.toUpperCase() },
      include: {
        customer: { select: { fullName: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order || order.deletedAt) return reply.code(404).send({ error: 'not_found' });

    const dueAmount = order.totalAmount - order.discountAmount - order.paidAmount;
    return {
      ticketCode: order.ticketCode,
      customerFirstName: order.customer.fullName.split(' ')[0],
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

  // QR PNG for an order
  app.get('/track/:code/qr.png', async (req, reply) => {
    const { code } = req.params as { code: string };
    const url = `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173'}/track/${code.toUpperCase()}`;
    const png = await QRCode.toBuffer(url, { type: 'png', margin: 1, width: 320 });
    reply.type('image/png');
    return png;
  });
}
