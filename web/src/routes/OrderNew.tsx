import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { extractPouch, fieldsToVerify, FIELD_LABELS, type PouchExtraction } from '../lib/vision';
import { Button, Card } from '../components/Atoms';
import { COLORS, fmtTND } from '../lib/tokens';
import { useAuth } from '../store/auth';

export function OrderNewPage() {
  const navigate = useNavigate();
  const me = useAuth((s) => s.user);

  const [shops, setShops] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);

  const [shopId, setShopId] = useState('');
  const [pouchNumber, setPouchNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+216 ');
  const [description, setDescription] = useState('');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('ESPECES');
  const [urgency, setUrgency] = useState('NORMAL');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanNotice, setScanNotice] = useState<{ kind: 'ok' | 'demo' | 'error'; text: string } | null>(null);
  const [pouchFile, setPouchFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Pré-remplissage venant de la page Scan (/scan -> "Pré-remplir le formulaire").
  useEffect(() => {
    const st = location.state as { extraction?: PouchExtraction; file?: File } | null;
    if (st?.extraction) applyExtraction(st.extraction, st.file ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/shops'), api.get('/services'), api.get('/users'), api.get('/catalog'),
    ]).then(([s, sv, u, c]) => {
      setShops(s.data.shops);
      setServices(sv.data.services);
      setUsers(u.data.users);
      setCatalog(c.data.items);
      if (s.data.shops[0]) setShopId(me?.shopId ?? s.data.shops[0].id);
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      setDeliveryDate(tomorrow.toISOString().slice(0, 10));
    });
  }, [me?.shopId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!description.trim()) return setError('Description obligatoire');
    if (!customerName.trim() || !customerPhone.trim()) return setError('Nom et téléphone obligatoires');
    if (totalAmount <= 0) return setError('Montant total > 0');
    setSubmitting(true);
    try {
      const cust = await api.post('/customers/lookup-or-create', {
        fullName: customerName, phone: customerPhone,
      });
      const r = await api.post('/orders', {
        shopId, customerId: cust.data.customer.id,
        pouchNumber: pouchNumber || null,
        description, totalAmount, paidAmount,
        urgency, deliveryDate,
        deliveryTime: deliveryTime || null,
        assignedToId: assignedToId || null,
        internalNotes: internalNotes || null,
        serviceIds, lineItems: [],
        paymentMethod: paidAmount > 0 ? paymentMethod : undefined,
      });
      // Archive la photo de la pochette scannée comme pièce jointe (best effort).
      if (pouchFile) {
        const fd = new FormData();
        fd.append('file', pouchFile);
        fd.append('kind', 'POUCH_SCAN');
        await api.post(`/orders/${r.data.order.id}/attachments`, fd).catch(() => {});
      }
      navigate(`/orders/${r.data.order.id}`);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const applyExtraction = (ex: PouchExtraction, file: File | null) => {
    const d = ex.data;
    if (d.pouchNumber) setPouchNumber(d.pouchNumber);
    if (d.customerName) setCustomerName(d.customerName);
    if (d.phone) setCustomerPhone(d.phone);
    if (d.description) setDescription(d.description);
    if (d.totalAmount) setTotalAmount(d.totalAmount);
    if (d.depositAmount) setPaidAmount(d.depositAmount);
    setPouchFile(file);
    if (ex.stub) {
      setScanNotice({ kind: 'demo', text: 'Mode démo : aucune clé API Vision configurée, ces données sont factices.' });
    } else {
      const toCheck = fieldsToVerify(d).map((f) => FIELD_LABELS[f]);
      setScanNotice({
        kind: 'ok',
        text: toCheck.length
          ? `Extrait par ${ex.provider}. À vérifier (confiance < 70 %) : ${toCheck.join(', ')}.`
          : `Extrait par ${ex.provider}. Vérifie les champs avant de valider.`,
      });
    }
  };

  const onPickFile = async (file: File) => {
    setScanLoading(true);
    setScanNotice(null);
    try {
      applyExtraction(await extractPouch(file), file);
    } catch (e: any) {
      setPouchFile(file); // la photo reste archivée même si l'IA échoue
      setScanNotice({ kind: 'error', text: e.message });
    } finally {
      setScanLoading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const due = totalAmount - paidAmount;
  const toggleService = (id: string) => setServiceIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>
        ← Retour
      </button>
      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 22, fontWeight: 700 }}>Nouvelle commande</div>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])} />
        <Button type="button" variant="accent" onClick={() => fileInput.current?.click()} disabled={scanLoading}>
          {scanLoading ? '⏳ Lecture de la pochette…' : '📸 Scanner pochette'}
        </Button>
      </div>
      {scanNotice && (
        <div style={{
          marginBottom: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: (scanNotice.kind === 'ok' ? COLORS.success : scanNotice.kind === 'demo' ? COLORS.warning : COLORS.danger) + '18',
          border: `1px solid ${scanNotice.kind === 'ok' ? COLORS.success : scanNotice.kind === 'demo' ? COLORS.warning : COLORS.danger}`,
        }}>
          {scanNotice.kind === 'error' ? '⚠️ ' : scanNotice.kind === 'demo' ? '🧪 ' : '✅ '}{scanNotice.text}
        </div>
      )}

      <form onSubmit={submit} className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <Card style={{ padding: 18 }}>
          <Section title="POCHETTE">
            <Field label="N° pochette papier (ex 0061340)">
              <input value={pouchNumber} onChange={(e) => setPouchNumber(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Boutique">
              <select value={shopId} onChange={(e) => setShopId(e.target.value)} style={inputStyle} required>
                {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="CLIENT">
            <Field label="Nom complet *">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={inputStyle} required />
            </Field>
            <Field label="GSM (+216 XX XXX XXX) *">
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={inputStyle} required />
            </Field>
          </Section>

          <Section title="COMMANDE">
            <Field label="Description *">
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows={4} placeholder="Ex: 50 cartes visite carton 250g + 1 album 30 pages"
                style={{ ...inputStyle, height: 'auto', padding: 10, resize: 'vertical' }} required
              />
            </Field>
            <Field label="Services (cliquer pour ajouter)">
              <div className="flex gap-2 flex-wrap">
                {services.map((s) => (
                  <button
                    key={s.id} type="button" onClick={() => toggleService(s.id)}
                    style={{
                      padding: '6px 10px', fontSize: 12, fontWeight: 600, borderRadius: 999,
                      background: serviceIds.includes(s.id) ? COLORS.primary : '#fff',
                      color: serviceIds.includes(s.id) ? '#fff' : COLORS.text,
                      border: `1px solid ${serviceIds.includes(s.id) ? COLORS.primary : COLORS.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Notes internes (équipe seulement)">
              <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={2} style={{ ...inputStyle, height: 'auto', padding: 10, resize: 'vertical' }} />
            </Field>
          </Section>
        </Card>

        <Card style={{ padding: 18 }}>
          <Section title="LIVRAISON">
            <Field label="Date *">
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} style={inputStyle} required />
            </Field>
            <Field label="Heure">
              <input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Urgence">
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)} style={inputStyle}>
                <option value="NORMAL">🟢 Normal</option>
                <option value="PRIORITAIRE">🟡 Prioritaire</option>
                <option value="URGENT">🔴 Urgent</option>
                <option value="EXPRESS">⚫ Express (jour-même)</option>
              </select>
            </Field>
            <Field label="Assigner à">
              <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} style={inputStyle}>
                <option value="">Personne</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} · {u.role}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="PAIEMENT">
            <Field label="Total (TND) *">
              <input type="number" step="0.001" value={totalAmount} onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)} style={inputStyle} required />
            </Field>
            <Field label="Acompte (TND)">
              <input type="number" step="0.001" value={paidAmount} onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} style={inputStyle} />
            </Field>
            {paidAmount > 0 && (
              <Field label="Mode acompte">
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
                  <option value="ESPECES">Espèces</option>
                  <option value="CARTE">Carte</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="CHEQUE">Chèque</option>
                  <option value="D17">D17</option>
                  <option value="EDINAR">Edinar</option>
                </select>
              </Field>
            )}
            <div style={{ background: COLORS.bg, padding: 12, borderRadius: 8, marginTop: 8 }}>
              <div className="flex justify-between" style={{ fontSize: 13 }}>
                <span style={{ color: COLORS.muted }}>Reste à payer :</span>
                <strong style={{ color: due > 0 ? COLORS.warning : COLORS.success }}>{fmtTND(Math.max(0, due))}</strong>
              </div>
            </div>
          </Section>

          {error && <div style={{ color: COLORS.danger, fontSize: 13, marginTop: 12 }}>{error}</div>}

          <div className="mt-4">
            <Button type="submit" size="lg" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Création…' : 'Créer la commande'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 38, padding: '0 12px', borderRadius: 8,
  border: `1px solid ${COLORS.border}`, fontSize: 14,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginBottom: 10 }}>{title}</div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}
