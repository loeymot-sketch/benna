import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // Wipe (idempotent)
  await prisma.postReadReceipt.deleteMany();
  await prisma.postReaction.deleteMany();
  await prisma.postMention.deleteMany();
  await prisma.teamPost.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderLineItem.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.serviceOnOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.catalogItem.deleteMany();
  await prisma.service.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();

  // Shops
  const [shop1, shop2] = await Promise.all([
    prisma.shop.create({ data: {
      name: 'Boutique 1 — Av. Bourguiba',
      address: '66, Av. Habib Bourguiba, 4180 Houmet Souk — Djerba',
      phone: '75 650 865',
    }}),
    prisma.shop.create({ data: {
      name: 'Boutique 2 — Place Ouled Haffouz',
      address: '9, Place Ouled Haffouz, Houmet Souk — Djerba',
      phone: '75 623 681',
    }}),
  ]);

  // Users — all start with the same demo PIN, but spec says first login flow.
  // For demo we pre-set PINs so you can log in straight away.
  const adelPin = await bcrypt.hash('123456', 10);  // ADMIN 6 digits
  const memberPin = await bcrypt.hash('1234', 10);  // members 4 digits

  const adel = await prisma.user.create({ data: {
    firstName: 'Adel', lastName: 'El Benna',
    role: 'ADMIN', shopId: shop1.id,
    pinHash: adelPin, pinSet: true,
    avatar: 'AD',
  }});
  const sonia = await prisma.user.create({ data: {
    firstName: 'Sonia', lastName: 'Ben Salem',
    role: 'RECEPTION', shopId: shop1.id, pinHash: memberPin, pinSet: true, avatar: 'SO',
  }});
  const karim = await prisma.user.create({ data: {
    firstName: 'Karim', lastName: 'Trabelsi',
    role: 'DESIGNER', shopId: shop1.id, pinHash: memberPin, pinSet: true, avatar: 'KA',
  }});
  const mehdi = await prisma.user.create({ data: {
    firstName: 'Mehdi', lastName: 'Lakhal',
    role: 'PRODUCTION', shopId: shop2.id, pinHash: memberPin, pinSet: true, avatar: 'ME',
  }});
  const yosra = await prisma.user.create({ data: {
    firstName: 'Yosra', lastName: 'Belhaj',
    role: 'PHOTOGRAPHER', shopId: shop1.id, pinHash: memberPin, pinSet: true, avatar: 'YO',
  }});
  const ali = await prisma.user.create({ data: {
    firstName: 'Ali', lastName: 'Brahim',
    role: 'PRODUCTION', shopId: shop2.id, pinHash: memberPin, pinSet: true, avatar: 'AL',
  }});
  // One member who hasn't set their PIN yet (for onboarding test)
  const imen = await prisma.user.create({ data: {
    firstName: 'Imen', lastName: 'Khemiri',
    role: 'RECEPTION', shopId: shop2.id,
    pinHash: '__not_set__', pinSet: false, avatar: 'IM',
  }});

  // Services (7 métiers)
  const services = await Promise.all([
    prisma.service.create({ data: { code: 'DESIGN', name: 'Design graphique', icon: '🎨' } }),
    prisma.service.create({ data: { code: 'IMPRESSION', name: 'Impression', icon: '🖨️' } }),
    prisma.service.create({ data: { code: 'SUBLIMATION', name: 'Sublimation', icon: '👕' } }),
    prisma.service.create({ data: { code: 'PHOTOBOOK', name: 'Photobook & Laminage', icon: '📚' } }),
    prisma.service.create({ data: { code: 'STUDIO', name: 'Studio shooting', icon: '📸' } }),
    prisma.service.create({ data: { code: 'ID_PHOTO', name: 'Photo d\'identité', icon: '🆔' } }),
    prisma.service.create({ data: { code: 'EVENT', name: 'Reportage extérieur', icon: '🎬' } }),
  ]);
  const svc = Object.fromEntries(services.map((s) => [s.code, s]));

  // Catalogue (~20 items)
  await prisma.catalogItem.createMany({ data: [
    { name: 'Carte de visite carton 250g (lot 50)', serviceId: svc.IMPRESSION.id, unitPrice: 25, unit: 'lot 50' },
    { name: 'Carte de visite carton 350g (lot 100)', serviceId: svc.IMPRESSION.id, unitPrice: 45, unit: 'lot 100' },
    { name: 'Flyer A5 quadri (lot 100)', serviceId: svc.IMPRESSION.id, unitPrice: 30, unit: 'lot 100' },
    { name: 'Affiche A3 papier brillant', serviceId: svc.IMPRESSION.id, unitPrice: 8, unit: 'pièce' },
    { name: 'Affiche A2 papier mat', serviceId: svc.IMPRESSION.id, unitPrice: 14, unit: 'pièce' },
    { name: 'Tirage photo 10x15', serviceId: svc.IMPRESSION.id, unitPrice: 0.5, unit: 'pièce' },
    { name: 'Tirage photo 20x30', serviceId: svc.IMPRESSION.id, unitPrice: 5, unit: 'pièce' },
    { name: 'Logo (forfait simple)', serviceId: svc.DESIGN.id, unitPrice: 80, unit: 'forfait' },
    { name: 'Faire-part de mariage (création)', serviceId: svc.DESIGN.id, unitPrice: 120, unit: 'création' },
    { name: 'T-shirt sublim taille S/M/L', serviceId: svc.SUBLIMATION.id, unitPrice: 35, unit: 'pièce' },
    { name: 'Mug sublim 11oz', serviceId: svc.SUBLIMATION.id, unitPrice: 18, unit: 'pièce' },
    { name: 'Coussin sublim 40x40', serviceId: svc.SUBLIMATION.id, unitPrice: 28, unit: 'pièce' },
    { name: 'Casquette sublim', serviceId: svc.SUBLIMATION.id, unitPrice: 22, unit: 'pièce' },
    { name: 'Photobook 20x25 (20 pages)', serviceId: svc.PHOTOBOOK.id, unitPrice: 75, unit: 'album' },
    { name: 'Photobook 30x30 (40 pages)', serviceId: svc.PHOTOBOOK.id, unitPrice: 180, unit: 'album' },
    { name: 'Plastification A4', serviceId: svc.PHOTOBOOK.id, unitPrice: 3, unit: 'pièce' },
    { name: 'Séance studio identité', serviceId: svc.ID_PHOTO.id, unitPrice: 8, unit: 'séance' },
    { name: 'Séance studio famille (1h)', serviceId: svc.STUDIO.id, unitPrice: 80, unit: 'séance' },
    { name: 'Reportage mariage (journée)', serviceId: svc.EVENT.id, unitPrice: 600, unit: 'forfait' },
    { name: 'Reportage anniversaire (2h)', serviceId: svc.EVENT.id, unitPrice: 150, unit: 'forfait' },
  ]});

  // Customers
  const c1 = await prisma.customer.create({ data: { fullName: 'Abdelwahab Khelifi', phone: '+21628555123', tags: '["Pro"]' } });
  const c2 = await prisma.customer.create({ data: { fullName: 'Fatma Trabelsi', phone: '+21625118899' } });
  const c3 = await prisma.customer.create({ data: { fullName: 'Mohamed Saidi', phone: '+21698330041', tags: '["VIP"]' } });
  const c4 = await prisma.customer.create({ data: { fullName: 'Leila Bouzid', phone: '+21655667788' } });
  const c5 = await prisma.customer.create({ data: { fullName: 'Anis Cherif', phone: '+21621003344' } });

  // Orders
  const ym = new Date().toISOString().slice(0, 7).replace('-', '');
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const inThreeDays = new Date(); inThreeDays.setDate(today.getDate() + 3);

  const o1 = await prisma.order.create({ data: {
    ticketCode: `LB-${ym}-0001`, pouchNumber: '0061340',
    shopId: shop1.id, customerId: c1.id,
    description: '50 cartes visite carton 250g — recto/verso\nLogo fourni — quadri',
    totalAmount: 25, paidAmount: 5, paymentStatus: 'ACOMPTE',
    urgency: 'URGENT', status: 'EN_COURS_DESIGN',
    deliveryDate: tomorrow, deliveryTime: '17:00',
    createdById: sonia.id, assignedToId: karim.id,
    services: { create: [{ serviceId: svc.DESIGN.id }, { serviceId: svc.IMPRESSION.id }] },
    statusHistory: { create: [
      { toStatus: 'RECUE', changedById: sonia.id, comment: 'Création depuis pochette 0061340' },
      { toStatus: 'EN_COURS_DESIGN', changedById: karim.id },
    ]},
    payments: { create: { amount: 5, method: 'ESPECES', receivedById: sonia.id } },
  }});

  const o2 = await prisma.order.create({ data: {
    ticketCode: `LB-${ym}-0002`,
    shopId: shop1.id, customerId: c2.id,
    description: 'Album mariage 30x30, 40 pages\nPhotos fournies sur clé USB',
    totalAmount: 180, paidAmount: 50, paymentStatus: 'ACOMPTE',
    urgency: 'NORMAL', status: 'EN_PRODUCTION',
    deliveryDate: inThreeDays,
    createdById: sonia.id, assignedToId: mehdi.id,
    services: { create: [{ serviceId: svc.PHOTOBOOK.id }] },
    statusHistory: { create: { toStatus: 'RECUE', changedById: sonia.id } },
    payments: { create: { amount: 50, method: 'CARTE', receivedById: sonia.id } },
  }});

  const o3 = await prisma.order.create({ data: {
    ticketCode: `LB-${ym}-0003`,
    shopId: shop2.id, customerId: c3.id,
    description: '20 t-shirts sublimés "Équipe Saidi" — taille mixte',
    totalAmount: 700, paidAmount: 700, paymentStatus: 'PAYE',
    urgency: 'PRIORITAIRE', status: 'PRETE',
    deliveryDate: today,
    createdById: adel.id, assignedToId: ali.id,
    services: { create: [{ serviceId: svc.SUBLIMATION.id }] },
    statusHistory: { create: { toStatus: 'RECUE', changedById: adel.id } },
    payments: { create: { amount: 700, method: 'VIREMENT', receivedById: adel.id } },
  }});

  const o4 = await prisma.order.create({ data: {
    ticketCode: `LB-${ym}-0004`,
    shopId: shop1.id, customerId: c4.id,
    description: '4 photos identité brevet',
    totalAmount: 8, paidAmount: 8, paymentStatus: 'PAYE',
    urgency: 'EXPRESS', status: 'LIVREE',
    deliveryDate: yesterday,
    createdById: sonia.id,
    services: { create: [{ serviceId: svc.ID_PHOTO.id }] },
    statusHistory: { create: { toStatus: 'RECUE', changedById: sonia.id } },
    payments: { create: { amount: 8, method: 'ESPECES', receivedById: sonia.id } },
  }});

  const o5 = await prisma.order.create({ data: {
    ticketCode: `LB-${ym}-0005`,
    shopId: shop1.id, customerId: c5.id,
    description: 'Reportage anniversaire 40 ans — 2h sur place\nLivrer 50 tirages 10x15 + galerie en ligne',
    totalAmount: 200, paidAmount: 0, paymentStatus: 'IMPAYE',
    urgency: 'NORMAL', status: 'RECUE',
    deliveryDate: inThreeDays,
    createdById: sonia.id, assignedToId: yosra.id,
    services: { create: [{ serviceId: svc.EVENT.id }, { serviceId: svc.IMPRESSION.id }] },
    statusHistory: { create: { toStatus: 'RECUE', changedById: sonia.id } },
  }});

  // Carnet posts
  await prisma.teamPost.create({ data: {
    type: 'ANNOUNCEMENT', body: 'Réunion équipe samedi 10h en boutique 1. Sujet : nouveau process scan IA.',
    authorId: adel.id, scope: 'ALL', urgency: 'NORMAL',
    pinnedUntil: inThreeDays,
  }});

  await prisma.teamPost.create({ data: {
    type: 'HANDOFF',
    body: 'Maquette validée par le client, à imprimer en 50 ex carton 250g recto/verso.',
    authorId: karim.id, scope: 'DIRECT', recipientUserId: mehdi.id,
    orderId: o1.id, urgency: 'HIGH',
  }});

  await prisma.teamPost.create({ data: {
    type: 'ALERT', body: 'Imprimante grand format : bourrage récurrent depuis hier — à surveiller.',
    authorId: ali.id, scope: 'ALL', urgency: 'HIGH',
  }});

  await prisma.teamPost.create({ data: {
    type: 'TASK', body: 'Rappeler M. Saidi pour confirmer l\'heure de retrait.',
    authorId: sonia.id, scope: 'DIRECT', recipientUserId: yosra.id,
    orderId: o3.id, urgency: 'NORMAL',
    deadline: tomorrow,
  }});

  await prisma.teamPost.create({ data: {
    type: 'QUESTION', body: 'Quel grammage pour le faire-part Bouzid : 250g ou 350g ?',
    authorId: karim.id, scope: 'DIRECT', recipientUserId: adel.id,
    urgency: 'NORMAL',
  }});

  console.log('✅ Seed done.');
  console.log('   ADMIN  : Adel  · PIN 123456');
  console.log('   MEMBER : Sonia, Karim, Mehdi, Yosra, Ali · PIN 1234');
  console.log('   ONBOARDING : Imen (PIN à définir)');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
