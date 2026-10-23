import { prisma } from './db.js';

// Temps réel sans WebSocket (Vercel n'en propose pas) : chaque évènement est noté en base,
// les postes le relisent toutes les quelques secondes via GET /api/events?after=<dernier id>.
// Le payload ne contient que des identifiants / libellés courts, jamais de montants.
export async function emit(type: string, payload: unknown) {
  try {
    await prisma.event.create({ data: { type, payload: JSON.stringify(payload ?? {}) } });
    // ménage : on ne garde qu'une heure d'historique (1 fois sur 20 pour ne pas surcharger)
    if (Math.random() < 0.05) {
      await prisma.event.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } } });
    }
  } catch (e) {
    console.error('emit failed', type, e); // un évènement perdu ne doit jamais faire échouer la requête
  }
}
