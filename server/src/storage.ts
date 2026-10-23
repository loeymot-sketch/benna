import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Stockage des pièces jointes. Deux modes, choisis par l'environnement :
//  • Supabase Storage (SUPABASE_URL + SUPABASE_SERVICE_KEY) : production (Vercel n'a pas de disque durable).
//    Bucket PRIVÉ ; les images sont lues via des liens signés temporaires. Appels REST directs, sans SDK.
//  • Disque local (par défaut) : développement.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve(__dirname, '../../data/uploads');

const sbUrl = () => (process.env.SUPABASE_URL ?? '').replace(/\/+$/, '');
const sbKey = () => process.env.SUPABASE_SERVICE_KEY ?? '';
const bucket = () => process.env.SUPABASE_BUCKET ?? 'attachments';
export const usesSupabase = () => !!sbUrl() && !!sbKey();

// Anciennes lignes : path = "/uploads/<orderId>/<fichier>" -> clé "<orderId>/<fichier>"
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
  const full = path.join(UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buf);
}

// Adresse utilisable dans <img src> / <a href>
export async function fileUrl(storedPath: string): Promise<string> {
  const key = toKey(storedPath);
  if (!usesSupabase()) return `/uploads/${key}`;
  const res = await fetch(`${sbUrl()}/storage/v1/object/sign/${bucket()}/${enc(key)}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${sbKey()}`, apikey: sbKey(), 'content-type': 'application/json' },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  if (!res.ok) return ''; // fichier introuvable : l'interface affichera un lien vide plutôt que de planter
  const j: any = await res.json();
  const signed: string = j.signedURL ?? j.signedUrl ?? '';
  return /^https?:/.test(signed) ? signed : `${sbUrl()}/storage/v1${signed}`;
}
