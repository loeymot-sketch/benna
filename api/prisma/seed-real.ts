import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { ensureReferenceData } from './reference-data.js';

// Comptes réels du labo. Idempotent : un compte existant n'est jamais modifié
// (son code reste le sien), sauf avec RESET_PINS=1 qui remet son code par défaut.
// Tous les comptes démarrent avec le code par défaut 0000 ; chacun est invité à
// choisir son code personnel à chaque connexion tant qu'il ne l'a pas fait.
// Les comptes de démonstration (Adel, Sonia, …) sont désactivés, pas supprimés.
const prisma = new PrismaClient();

const TEAM = [
  { firstName: 'Seif',    lastName: '',  role: 'ADMIN' },
  { firstName: 'Ghaith',  lastName: '',  role: 'ADMIN' },
  { firstName: 'Imed',    lastName: '',  role: 'ADMIN' },
  { firstName: 'Mounira', lastName: '',  role: 'ADMIN' },
  { firstName: 'Najet',   lastName: '',  role: 'MANAGER' },
  { firstName: 'Invité',  lastName: '1', role: 'PRODUCTION' },
  { firstName: 'Invité',  lastName: '2', role: 'PRODUCTION' },
] as const;

const DEFAULT_PIN = '0000';

async function main() {
  await ensureReferenceData(prisma);
  const realKeys = new Set(TEAM.map((m) => `${m.firstName}|${m.lastName}`));
  const created: { name: string; role: string; pin: string }[] = [];
  const existing: string[] = [];

  for (const m of TEAM) {
    const found = await prisma.user.findFirst({ where: { firstName: m.firstName, lastName: m.lastName } });
    const name = `${m.firstName} ${m.lastName}`.trim();
    const pin = DEFAULT_PIN;
    if (found && process.env.RESET_PINS === '1') {
      await prisma.user.update({ where: { id: found.id }, data: {
        pinHash: await bcrypt.hash(pin, 10), pinSet: true, mustChangePin: true, failedAttempts: 0, lockedUntil: null, isActive: true,
      }});
      created.push({ name, role: m.role, pin });
      continue;
    }
    if (found) { existing.push(name); continue; }
    await prisma.user.create({ data: {
      firstName: m.firstName, lastName: m.lastName, role: m.role,
      avatar: (m.firstName[0] + (m.lastName[0] ?? m.firstName[1] ?? '')).toUpperCase(),
      pinHash: await bcrypt.hash(pin, 10), pinSet: true, mustChangePin: true,
    }});
    created.push({ name: `${m.firstName} ${m.lastName}`.trim(), role: m.role, pin });
  }

  const all = await prisma.user.findMany();
  const demo = all.filter((u) => !realKeys.has(`${u.firstName}|${u.lastName}`) && u.isActive);
  for (const u of demo) await prisma.user.update({ where: { id: u.id }, data: { isActive: false } });

  console.log('\n✅ Comptes réels prêts.');
  if (created.length) {
    console.log(`\nCode par défaut ${DEFAULT_PIN} remis à : ${created.map((c) => c.name).join(', ')}`);
  }
  if (existing.length) console.log(`\nDéjà existants (inchangés) : ${existing.join(', ')}`);
  if (demo.length) console.log(`\nComptes démo désactivés : ${demo.map((u) => u.firstName).join(', ')}`);
}

main().finally(() => prisma.$disconnect());
