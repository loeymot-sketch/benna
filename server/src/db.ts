// Import par défaut : le paquet est en CommonJS, l'import nommé échoue dans la fonction Vercel (ESM)
import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg;

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
