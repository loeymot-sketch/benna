import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { emit } from '../events.js';

// Le code ticket (LB-AAAAMM-0001) est séquentiel donc devinable : il ne suffit PAS à voir les données du client.
// Le QR remis au client contient aussi un secret aléatoire (?k=…). Sans lui, la page publique ne montre que
// l'étape et les dates (aucun nom, montant, ni numéro) et le choix de notification est refusé.
const keyOk = (order: { trackKey: string | null }, k?: string | null) => !!order.trackKey && !!k && k === order.trackKey;

export default async function trackRoutes(app: FastifyInstance) {
  app.get('/track/:code', async (req, reply) => {
    const { code } = req.params as { code: string };
    const { k } = (req.query ?? {}) as { k?: string };
    const order = await prisma.order.findUnique({
      where: { ticketCode: code.toUpperCase() },
      include: {
        customer: { select: { fullName: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order || order.deletedAt) return reply.code(404).send({ error: 'not_found' });

    const base = {
      ticketCode: order.ticketCode,
      status: order.status,
      urgency: order.urgency,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryTime,
      plannedFor: order.plannedFor,
      plannedNote: order.plannedNote,
      timeline: order.statusHistory.map((h) => ({ toStatus: h.toStatus, at: h.createdAt })),
    };
    if (!keyOk(order, k)) return { ...base, limited: true };

    const dueAmount = order.totalAmount - order.discountAmount - order.paidAmount;
    return {
      ...base,
      limited: false,
      customerFirstName: order.customer.fullName.trim().split(' ')[0] ?? '',
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      paidAmount: order.paidAmount,
      notifyMode: order.notifyMode,
      hasPhone: !!(order.customer.phone || order.notifyPhone),
      remainingAmount: Math.max(0, dueAmount),
    };
  });

  // Le client choisit comment être prévenu quand c'est prêt (public, mais exige le secret du QR)
  app.post('/track/:code/notify', async (req, reply) => {
    const { code } = req.params as { code: string };
    const Body = z.object({
      mode: z.enum(['NONE', 'CALL', 'WHATSAPP']),
      phone: z.string().max(30).optional().nullable(),
      key: z.string().max(64).optional().nullable(),
    });
    const { mode, phone, key } = Body.parse(req.body);
    const order = await prisma.order.findUnique({ where: { ticketCode: code.toUpperCase() }, include: { customer: true } });
    // Même réponse qu'un code inconnu si le secret est faux : on ne confirme pas l'existence de la commande.
    if (!order || order.deletedAt || !keyOk(order, key)) return reply.code(404).send({ error: 'not_found' });
    // Commande prête ou terminée : le choix n'a plus d'effet (la file « à prévenir » est déjà créée / inutile).
    if (['PRETE', 'LIVREE', 'ANNULEE'].includes(order.status)) return reply.code(409).send({ error: 'order_closed' });
    // Un numéro déjà connu (fiche client ou saisi avant) ne se remplace jamais depuis la page publique ; l'équipe le corrige côté admin.
    const known = order.customer.phone || order.notifyPhone;
    const digits = (phone ?? '').replace(/\D/g, '');
    if (!known && digits.length > 0 && digits.length < 8) return reply.code(400).send({ error: 'invalid_phone' });
    let notifyPhone = order.notifyPhone;
    if (!known && digits.length >= 8) notifyPhone = digits.startsWith('216') ? `+${digits}` : digits.length === 8 ? `+216${digits}` : `+${digits}`;
    if (mode !== 'NONE' && !order.customer.phone && !notifyPhone) return reply.code(400).send({ error: 'phone_required' });
    await prisma.order.update({
      where: { id: order.id },
      data: { notifyMode: mode, notifyPhone, notifyRequestedAt: mode === 'NONE' ? null : new Date() },
    });
    await emit('order.updated', { id: order.id });
    return { ok: true, notifyMode: mode };
  });
}
