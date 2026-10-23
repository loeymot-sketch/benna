import { z } from 'zod';

// Vision IA — extraction des champs d'une pochette papier manuscrite.
// Adapter pattern : un même prompt, plusieurs providers (OpenAI / Gemini / Anthropic),
// essayés en cascade dans l'ordre de VISION_PROVIDERS. Aucune dépendance : fetch natif.

export const FIELDS = [
  'pouchNumber', 'customerName', 'phone', 'date', 'totalAmount', 'depositAmount', 'description',
] as const;

const SYSTEM_PROMPT = `Tu es un assistant d'extraction de données pour un laboratoire photo en Tunisie.
On te montre une photo d'une POCHETTE PAPIER manuscrite en français.

La pochette appartient à "Labo Photo Numérique EL BENNA" et contient ces champs :
- Numéro de pochette pré-imprimé (en haut à droite, format à 7 chiffres ex: 0061340)
- Nom : nom du client (manuscrit)
- Acompte : montant payé d'avance en TND (manuscrit, peut être vide)
- Date : date de prise de commande (manuscrit, format JJ/MM/AAAA ou similaire)
- GSM : numéro de téléphone tunisien (8 chiffres, parfois précédé de +216)
- Cachet : montant total en TND (manuscrit)
- Description de la commande : grande zone centrale avec texte manuscrit libre
  (ex: "50 cartes visite carton", "album mariage 30p", "t-shirt sublim taille L")

INSTRUCTIONS :
1. Examine attentivement chaque champ.
2. Pour les chiffres (montants, téléphone, n° pochette), sois précis.
3. Si un champ est vide, illisible ou absent, retourne null.
4. Pour chaque champ extrait, donne un score de confiance entre 0 et 1
   (1 = parfaitement clair, 0.5 = douteux, 0 = totalement illisible).
5. La description peut être multi-ligne — préserve les retours à la ligne.
6. Les montants peuvent contenir des espaces (ex: "12 000" = 12000 millimes ou 12 dinars).
   En Tunisie, les montants sont souvent écrits en millimes (12000 = 12 dinars).
   Détecte le contexte et retourne en TND (dinars). Si tu n'es pas sûr, garde la valeur brute
   et baisse la confiance.

RETOURNE UNIQUEMENT UN JSON VALIDE — aucun texte avant ou après — au format suivant :

{
  "pouchNumber": "0061340" | null,
  "customerName": "Abdelwahab" | null,
  "phone": "+216XXXXXXXX" | null,
  "date": "2026-05-09" | null,
  "totalAmount": 12.000 | null,
  "depositAmount": 0 | null,
  "description": "50 Cartes Visite Carton" | null,
  "confidence": {
    "pouchNumber": 0.95,
    "customerName": 0.85,
    "phone": 0.0,
    "date": 0.0,
    "totalAmount": 0.7,
    "depositAmount": 0.0,
    "description": 0.9
  },
  "notes": "Téléphone et date non remplis sur la pochette"
}`;

export type PouchExtraction = {
  pouchNumber: string | null;
  customerName: string | null;
  phone: string | null;
  date: string | null;
  totalAmount: number | null;
  depositAmount: number | null;
  description: string | null;
  confidence: Record<string, number>;
  notes: string | null;
};

type Provider = {
  name: string;
  isConfigured: () => boolean;
  call: (img: { base64: string; mimeType: string }, prompt: string, signal: AbortSignal) => Promise<string>;
};

async function postJson(url: string, headers: Record<string, string>, body: unknown, signal: AbortSignal) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

// OpenAI et OpenRouter parlent le même protocole (chat/completions) : seul l'endpoint,
// la clé et le nom du modèle changent.
function chatCompletionsProvider(
  name: string, keyVar: string, baseUrl: () => string, model: () => string, extraHeaders: Record<string, string> = {},
): Provider {
  return {
  name,
  isConfigured: () => !!process.env[keyVar],
  async call({ base64, mimeType }, prompt, signal) {
    const j = await postJson(
      `${baseUrl()}/chat/completions`,
      { authorization: `Bearer ${process.env[keyVar]}`, ...extraHeaders },
      {
        model: model(),
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: [
            { type: 'text', text: 'Extrais les champs de cette pochette.' },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' } },
          ] },
        ],
      },
      signal,
    );
    return j.choices?.[0]?.message?.content ?? '';
  },
  };
}

const openai = chatCompletionsProvider(
  'openai', 'OPENAI_API_KEY',
  () => process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  () => process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
);

const openrouter = chatCompletionsProvider(
  'openrouter', 'OPENROUTER_API_KEY',
  () => process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  () => process.env.OPENROUTER_VISION_MODEL ?? 'openai/gpt-4o-mini',
  { 'x-title': 'El Benna Lab OS' },
);

const gemini: Provider = {
  name: 'gemini',
  isConfigured: () => !!process.env.GEMINI_API_KEY,
  async call({ base64, mimeType }, prompt, signal) {
    const model = process.env.GEMINI_VISION_MODEL ?? 'gemini-2.5-flash';
    const j = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      { 'x-goog-api-key': process.env.GEMINI_API_KEY! },
      {
        systemInstruction: { parts: [{ text: prompt }] },
        contents: [{ role: 'user', parts: [
          { text: 'Extrais les champs de cette pochette.' },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      },
      signal,
    );
    return j.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
  },
};

const anthropic: Provider = {
  name: 'anthropic',
  isConfigured: () => !!process.env.ANTHROPIC_API_KEY,
  async call({ base64, mimeType }, prompt, signal) {
    const j = await postJson(
      'https://api.anthropic.com/v1/messages',
      { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      {
        model: process.env.ANTHROPIC_VISION_MODEL ?? 'claude-haiku-4-5',
        max_tokens: 1024,
        temperature: 0,
        system: prompt,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: 'Extrais les champs de cette pochette.' },
        ] }],
      },
      signal,
    );
    return j.content?.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') ?? '';
  },
};

const PROVIDERS: Record<string, Provider> = { openrouter, openai, gemini, anthropic };

export function configuredProviders(): Provider[] {
  const order = (process.env.VISION_PROVIDERS ?? 'openrouter,openai,gemini,anthropic')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return order.map((n) => PROVIDERS[n]).filter((p): p is Provider => !!p && p.isConfigured());
}

// --- Normalisation de la réponse du modèle ---------------------------------

const nullableStr = z.preprocess((v) => (v == null || v === '' ? null : String(v)), z.string().nullable());
const nullableNum = z.preprocess((v) => {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}, z.number().nullable());

const RawSchema = z.object({
  pouchNumber: nullableStr.optional(),
  customerName: nullableStr.optional(),
  phone: nullableStr.optional(),
  date: nullableStr.optional(),
  totalAmount: nullableNum.optional(),
  depositAmount: nullableNum.optional(),
  description: nullableStr.optional(),
  confidence: z.record(z.any()).optional(),
  notes: nullableStr.optional(),
});

// Les montants tunisiens sont souvent écrits en millimes : 12000 -> 12 TND.
function toTnd(n: number | null | undefined): number | null {
  if (n == null) return null;
  return n >= 1000 && Number.isInteger(n) ? n / 1000 : n;
}

function normalizePhone(p: string | null | undefined): string | null {
  if (!p) return null;
  const digits = p.replace(/\D/g, '');
  const local = digits.startsWith('216') ? digits.slice(3) : digits;
  return local.length === 8 ? `+216 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}` : p.trim();
}

function normalizeDate(d: string | null | undefined): string | null {
  if (!d) return null;
  const iso = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const fr = d.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);
  if (fr) {
    const y = fr[3].length === 2 ? `20${fr[3]}` : fr[3];
    return `${y}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`;
  }
  return null;
}

export function parseExtraction(raw: string): PouchExtraction {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('no_json_in_response');
  const r = RawSchema.parse(JSON.parse(cleaned.slice(start, end + 1)));

  const confidence: Record<string, number> = {};
  for (const f of FIELDS) {
    const c = Number(r.confidence?.[f]);
    confidence[f] = Number.isFinite(c) ? Math.min(1, Math.max(0, c)) : 0;
  }
  return {
    pouchNumber: r.pouchNumber?.replace(/\D/g, '') || null,
    customerName: r.customerName?.trim() || null,
    phone: normalizePhone(r.phone),
    date: normalizeDate(r.date),
    totalAmount: toTnd(r.totalAmount),
    depositAmount: toTnd(r.depositAmount),
    description: r.description?.trim() || null,
    confidence,
    notes: r.notes ?? null,
  };
}

export type ExtractResult =
  | { ok: true; provider: string; data: PouchExtraction }
  | { ok: false; errors: { provider: string; error: string }[] };

export async function extractPouch(img: { base64: string; mimeType: string }): Promise<ExtractResult> {
  const prompt = `${SYSTEM_PROMPT}\n\nDate du jour : ${new Date().toISOString().slice(0, 10)}.`;
  const errors: { provider: string; error: string }[] = [];
  for (const p of configuredProviders()) {
    try {
      const raw = await p.call(img, prompt, AbortSignal.timeout(45_000));
      return { ok: true, provider: p.name, data: parseExtraction(raw) };
    } catch (e: any) {
      errors.push({ provider: p.name, error: String(e?.message ?? e).slice(0, 300) });
    }
  }
  return { ok: false, errors };
}
