import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractPouch } from '../lib/vision';
import { Card, Button } from '../components/Atoms';
import { COLORS, fmtTND } from '../lib/tokens';

export function ScanPage() {
  const [loading, setLoading] = useState(false);
  const [extraction, setExtraction] = useState<any>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFile = async (f: File) => {
    setImgPreview(URL.createObjectURL(f));
    setFile(f);
    setExtraction(null);
    setError(null);
    setLoading(true);
    try {
      setExtraction(await extractPouch(f));
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>📸 Pochette papier</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>Photo ou upload — l'IA extrait les champs.</div>
          <label className="block cursor-pointer" style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
            {imgPreview ? (
              <img src={imgPreview} style={{ width: '100%', borderRadius: 8 }} />
            ) : (
              <div>
                <div style={{ fontSize: 40 }}>📷</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>Sélectionner une photo</div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>JPG / PNG — caméra ou fichier</div>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
          {loading && <div className="mt-4" style={{ color: COLORS.muted, fontSize: 13 }}>⏳ Extraction en cours…</div>}
          {error && <div className="mt-4" style={{ color: COLORS.danger, fontSize: 13, fontWeight: 600 }}>⚠️ {error}</div>}
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>🤖 Champs extraits</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>
            {extraction?.stub
              ? '⚠️ Mode démo (aucune clé API Vision configurée). Données factices — rien n\'est lu sur la photo.'
              : `Extrait par ${extraction?.provider ?? 'IA'} — score de confiance par champ, jaune si < 70%.`}
          </div>
          {!extraction && <div style={{ fontSize: 13, color: COLORS.muted }}>Importe une pochette pour commencer.</div>}
          {extraction && (
            <div className="flex flex-col gap-2.5">
              <Field label="N° pochette" value={extraction.data.pouchNumber} confidence={extraction.data.confidence?.pouchNumber} />
              <Field label="Client" value={extraction.data.customerName} confidence={extraction.data.confidence?.customerName} />
              <Field label="GSM" value={extraction.data.phone} confidence={extraction.data.confidence?.phone} />
              <Field label="Total (TND)" value={extraction.data.totalAmount && fmtTND(extraction.data.totalAmount)} confidence={extraction.data.confidence?.totalAmount} />
              <Field label="Acompte" value={extraction.data.depositAmount && fmtTND(extraction.data.depositAmount)} confidence={extraction.data.confidence?.depositAmount} />
              <Field label="Description" value={extraction.data.description} confidence={extraction.data.confidence?.description} multiline />
              <Button onClick={() => navigate('/orders/new', { state: { extraction, file } })} className="mt-4">→ Pré-remplir le formulaire</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, confidence, multiline }: { label: string; value: any; confidence?: number; multiline?: boolean }) {
  const lowConf = confidence != null && confidence < 0.7;
  return (
    <div style={{ background: lowConf ? COLORS.warning + '12' : COLORS.bg, padding: 10, borderRadius: 8, border: `1px solid ${lowConf ? COLORS.warning : COLORS.border}` }}>
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4 }}>{label}</div>
        {confidence != null && (
          <div style={{ fontSize: 10, fontWeight: 600, color: lowConf ? COLORS.warning : COLORS.success }}>
            {Math.round(confidence * 100)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: multiline ? 13 : 14, fontWeight: 600, marginTop: 4, whiteSpace: 'pre-wrap' }}>{value ?? <span style={{ color: COLORS.muted, fontStyle: 'italic' }}>—</span>}</div>
    </div>
  );
}
