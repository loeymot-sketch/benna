import type { PrismaClient } from '@prisma/client';

// Données de référence nécessaires au fonctionnement (boutiques, services, catalogue de prix).
// Créées seulement si les tables sont vides : jamais d'écrasement de ce que l'admin a modifié.
export async function ensureReferenceData(prisma: PrismaClient) {
  if ((await prisma.shop.count()) === 0) {
    await prisma.shop.createMany({ data: [
      { name: 'Boutique 1 — Av. Bourguiba', address: '66, Av. Habib Bourguiba, 4180 Houmet Souk — Djerba', phone: '75 650 865' },
      { name: 'Boutique 2 — Place Ouled Haffouz', address: '9, Place Ouled Haffouz, Houmet Souk — Djerba', phone: '75 623 681' },
    ]});
  }
  if ((await prisma.service.count()) > 0) return;

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
}
