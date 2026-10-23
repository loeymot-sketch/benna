import { prisma } from './db.js';

// Stockage des pièces jointes. Deux modes, choisis par l'environnement :
//  • Supabase Storage PRIVÉ (SUPABASE_URL + SUPABASE_SERVICE_KEY = clé secrète côté serveur) : liens signés temporaires.
//  • Sinon : dans Postgres (table FileBlob) — aucune clé requise, fonctionne partout (Vercel inclus).
//    Les images sont lues via /api/files/<clé>?t=<jeton court> : réservé aux utilisateurs connectés.
const sbUrl = () => (process.env.SUPABASE_URL ?? '').replace(/\/+$/, '');
const sbKey = () => process.env.SUPABASE_SERVICE_KEY ?? '';
const bucket = () => process.env.SUPABASE_BUCKET ?? 'attachments';
export const usesSupabase = () => !!sbUrl() && !!sbKey();

export const toKey = (p: string) => p.replace(/^\/uploads\//, '');
const enc = (key: string) => key.split('/').map(encodeURIComponent).join('/');

export async function putFile(key: string, buf: Buffer, mimeType: string): Promise<void> {
  if (usesSupabase()) {
    const res = await fetch(`${sbUrl()}/storage/v1/object/${bucket()}/${enc(key)}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${sbKey()}`, apikey: sbKey(), 'content-type': mimeType, 'x-upsert': 'false' },
      body: new Uint8Array(buf),
    });
    if (!res.ok) throw new Error(`storage_upload_failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return;
  }
  await prisma.fileBlob.create({ data: { key, data: buf, mimeType } });
}

// Adresse utilisable dans <img src> / <a href>. `sign` fabrique un jeton court pour le mode Postgres.
export async function fileUrl(storedPath: string, sign: (key: string) => string): Promise<string> {
  const key = toKey(storedPath);
  if (!usesSupabase()) return `/api/files/${enc(key)}?t=${sign(key)}`;
  const res = await fetch(`${sbUrl()}/storage/v1/object/sign/${bucket()}/${enc(key)}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${sbKey()}`, apikey: sbKey(), 'content-type': 'application/json' },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  if (!res.ok) return '';
  const j: any = await res.json();
  const signed: string = j.signedURL ?? j.signedUrl ?? '';
  return /^https?:/.test(signed) ? signed : `${sbUrl()}/storage/v1${signed}`;
}

export async function readBlob(key: string) {
  return prisma.fileBlob.findUnique({ where: { key } });
}
