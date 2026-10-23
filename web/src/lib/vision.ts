import { api } from './api';

export type PouchData = {
  pouchNumber: string | null;
  customerName: string | null;
  phone: string | null;
  date: string | null;
  totalAmount: number | null;
  depositAmount: number | null;
  description: string | null;
  confidence?: Record<string, number>;
  notes?: string | null;
};

export type PouchExtraction = { stub: boolean; provider: string | null; message?: string; data: PouchData };

export const LOW_CONFIDENCE = 0.7;

export const FIELD_LABELS: Record<string, string> = {
  pouchNumber: 'N° pochette', customerName: 'Client', phone: 'GSM', date: 'Date',
  totalAmount: 'Total', depositAmount: 'Acompte', description: 'Description',
};

// Envoie la photo de la pochette à l'API, qui interroge le provider Vision configuré.
export async function extractPouch(file: File): Promise<PouchExtraction> {
  const fd = new FormData();
  fd.append('file', file);
  try {
    const r = await api.post<PouchExtraction>('/vision/extract-pouch', fd);
    return r.data;
  } catch (e: any) {
    throw new Error(e.response?.data?.message ?? 'Extraction impossible — saisie manuelle requise.');
  }
}

// Champs extraits dont la confiance est trop basse (ou nulle) : à faire vérifier par l'utilisateur.
export function fieldsToVerify(d: PouchData): string[] {
  return Object.keys(FIELD_LABELS).filter((f) => (d as any)[f] != null && (d.confidence?.[f] ?? 0) < LOW_CONFIDENCE);
}
