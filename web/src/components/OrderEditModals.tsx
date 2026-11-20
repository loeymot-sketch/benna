import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card, Button } from './Atoms';
import { COLORS, fmtTND, localISODate } from '../lib/tokens';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', height: 38, padding: '0 12px', borderRadius: 8,
  border: `1px solid ${COLORS.border}`, fontSize: 14, background: '#fff',
};

const ERRORS: Record<string, string> = {
  discount_exceeds_total: 'La remise ne peut pas dépasser le prix total.',
  invalid_phone: 'Numéro de GSM incomplet (8 chiffres minimum).',
  phone_exists: 'Ce GSM appartient déjà à un autre client.',
  forbidden: 'Action réservée aux responsables.',
};
export const errMsg = (e: any) => ERRORS[e?.response?.data?.error] ?? 'Enregistrement impossible, réessaie.';

export function Modal({ title, onClose, children, width = 560 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 flex items-start justify-center" onMouseDown={onClose}
      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 100, overflowY: 'auto', padding: '40px 12px' }}>
      <div onMouseDown={(e) => e.stopPropagation()} style={{ width, maxWidth: '100%' }}>
        <Card style={{ padding: 22 }}>
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
            <button type="button" onClick={onClose} aria-label="Fermer"
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: COLORS.muted }}>✕</button>
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

const URGENCIES: [string, string][] = [['NORMAL', '🟢 Normal'], ['PRIORITAIRE', '🟡 Prioritaire'], ['URGENT', '🔴 Urgent'], ['EXPRESS', '⚫ Express']];

const toDate = (d?: string | null) => (d ? localISODate(new Date(d)) : '');
const num = (v: string) => { const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? NaN : n; };

/** Modifier la commande : prix, remise, description, urgence, livraison, pochette, services, notes. */
export function EditOrderModal({ order, onClose, onSaved, focus }: { order: any; onClose: () => void; onSaved: () => void; focus?: 'price' }) {
  const [total, setTotal] = useState(String(order.totalAmount ?? 0));
  const [discount, setDiscount] = useState(String(order.discountAmount ?? 0));
  const [description, setDescription] = useState(order.description ?? '');
  const [urgency, setUrgency] = useState(order.urgency);
  const [deliveryDate, setDeliveryDate] = useState(toDate(order.deliveryDate));
  const [deliveryTime, setDeliveryTime] = useState(order.deliveryTime ?? '');
  const [pouch, setPouch] = useState(order.pouchNumber ?? '');
  const [notes, setNotes] = useState(order.internalNotes ?? '');
  const [serviceIds, setServiceIds] = useState<string[]>(order.services?.map((s: any) => s.serviceId) ?? []);
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get('/services').then((r) => setServices(r.data.services)).catch(() => {}); }, []);

  const t = num(total);
  const d = num(discount || '0');
  const net = (isNaN(t) ? 0 : t) - (isNaN(d) ? 0 : d);
  const due = net - order.paidAmount;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isNaN(t) || t < 0) return setError('Prix total invalide.');
    if (isNaN(d) || d < 0) return setError('Remise invalide.');
    if (d > t) return setError(ERRORS.discount_exceeds_total);
    if (!description.trim()) return setError('La description est obligatoire.');
    if (!deliveryDate) return setError('La date de livraison est obligatoire.');

    // On n'envoie que ce qui a changé (l'historique ne garde que les vraies modifications)
    const patch: Record<string, unknown> = {};
    if (t !== order.totalAmount) patch.totalAmount = t;
    if (d !== order.discountAmount) patch.discountAmount = d;
    if (description.trim() !== order.description) patch.description = description.trim();
    if (urgency !== order.urgency) patch.urgency = urgency;
    if (deliveryDate !== toDate(order.deliveryDate)) {
      const [y, m, dd] = deliveryDate.split('-').map(Number);
      patch.deliveryDate = new Date(y, m - 1, dd, 12).toISOString(); // midi local : pas de décalage de jour
    }
    if ((deliveryTime || null) !== (order.deliveryTime || null)) patch.deliveryTime = deliveryTime || null;
    if ((pouch.trim() || null) !== (order.pouchNumber || null)) patch.pouchNumber = pouch.trim() || null;
    if ((notes.trim() || null) !== (order.internalNotes || null)) patch.internalNotes = notes.trim() || null;
    const before = (order.services?.map((s: any) => s.serviceId) ?? []).slice().sort().join(',');
    if (serviceIds.slice().sort().join(',') !== before) patch.serviceIds = serviceIds;

    if (Object.keys(patch).length === 0) return onClose();
    setBusy(true);
    try {
      await api.patch(`/orders/${order.id}`, patch);
      onSaved(); onClose();
    } catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };

  const toggle = (id: string) => setServiceIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Modal title={`Modifier ${order.ticketCode}`} onClose={onClose} width={640}>
      <form onSubmit={save}>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginBottom: 8 }}>PRIX</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <Field label="Prix total (TND)">
            <input type="number" step="0.001" min="0" value={total} onChange={(e) => setTotal(e.target.value)}
              autoFocus={focus === 'price'} onFocus={(e) => e.target.select()} style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }} />
          </Field>
          <Field label="Remise (TND)">
            <input type="number" step="0.001" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)}
              onFocus={(e) => e.target.select()} style={inputStyle} />
          </Field>
        </div>
        <div className="flex gap-4 flex-wrap" style={{ background: COLORS.bg, borderRadius: 8, padding: '10px 12px', fontSize: 13, marginBottom: 16 }}>
          <span>À payer : <strong>{fmtTND(Math.max(0, net))}</strong></span>
          <span>Déjà payé : <strong style={{ color: COLORS.success }}>{fmtTND(order.paidAmount)}</strong></span>
          <span>{due > 0 ? <>Reste : <strong style={{ color: COLORS.danger }}>{fmtTND(due)}</strong></>
            : due < 0 ? <strong style={{ color: COLORS.warning }}>Trop payé : {fmtTND(-due)} à rendre</strong>
            : <strong style={{ color: COLORS.success }}>✓ Soldée</strong>}</span>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginBottom: 8 }}>COMMANDE</div>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            style={{ ...inputStyle, height: 'auto', padding: 10, resize: 'vertical' }} />
        </Field>
        <Field label="Services">
          <div className="flex gap-2 flex-wrap">
            {services.map((s) => {
              const on = serviceIds.includes(s.id);
              return (
                <button key={s.id} type="button" onClick={() => toggle(s.id)} style={{
                  padding: '6px 10px', fontSize: 12, fontWeight: 600, borderRadius: 999, cursor: 'pointer',
                  background: on ? COLORS.primary : '#fff', color: on ? '#fff' : COLORS.text,
                  border: `1px solid ${on ? COLORS.primary : COLORS.border}`,
                }}>{s.icon} {s.name}</button>
              );
            })}
            {services.length === 0 && <span style={{ fontSize: 12, color: COLORS.muted }}>Chargement…</span>}
          </div>
        </Field>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <Field label="N° de pochette">
            <input value={pouch} onChange={(e) => setPouch(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Date de livraison">
            <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Heure">
            <input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <Field label="Urgence">
          <div className="flex gap-2 flex-wrap">
            {URGENCIES.map(([v, l]) => (
              <button key={v} type="button" onClick={() => setUrgency(v)} style={{
                padding: '7px 12px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
                background: urgency === v ? COLORS.primary : '#fff', color: urgency === v ? '#fff' : COLORS.text,
                border: `1px solid ${urgency === v ? COLORS.primary : COLORS.border}`,
              }}>{l}</button>
            ))}
          </div>
        </Field>
        <Field label="Notes internes (équipe seulement)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            style={{ ...inputStyle, height: 'auto', padding: 10, resize: 'vertical' }} />
        </Field>

        {error && <div role="alert" style={{ color: COLORS.danger, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{error}</div>}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </div>
      </form>
    </Modal>
  );
}

/** Modifier la fiche du client depuis la commande. */
export function EditCustomerModal({ order, onClose, onSaved }: { order: any; onClose: () => void; onSaved: () => void }) {
  const c = order.customer ?? {};
  const [fullName, setFullName] = useState(c.fullName ?? '');
  const [phone, setPhone] = useState(c.phone ?? '');
  const [email, setEmail] = useState(c.email ?? '');
  const [notes, setNotes] = useState(c.notes ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await api.patch(`/customers/${c.id}`, { fullName, phone: phone.trim() || null, email: email.trim() || null, notes: notes.trim() || null, orderId: order.id });
      onSaved(); onClose();
    } catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <Modal title="Modifier le client" onClose={onClose} width={480}>
      <form onSubmit={save}>
        <Field label="Nom complet"><input value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus style={inputStyle} /></Field>
        <Field label="GSM" hint="Laisser vide si le client n'a pas donné de numéro.">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" style={inputStyle} />
        </Field>
        <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} /></Field>
        <Field label="Notes sur le client">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, height: 'auto', padding: 10, resize: 'vertical' }} />
        </Field>
        <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 12 }}>La fiche est partagée : la modification s'applique à toutes les commandes de ce client.</div>
        {error && <div role="alert" style={{ color: COLORS.danger, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{error}</div>}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </div>
      </form>
    </Modal>
  );
}

/** Corriger un paiement (montant / mode). */
export function EditPaymentModal({ order, payment, methods, onClose, onSaved }: { order: any; payment: any; methods: string[]; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState(String(payment.amount));
  const [method, setMethod] = useState(payment.method);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = num(amount);
    if (isNaN(a) || a <= 0) return setError('Montant invalide.');
    setError(''); setBusy(true);
    try {
      await api.patch(`/orders/${order.id}/payments/${payment.id}`, { amount: a, method });
      onSaved(); onClose();
    } catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm(`Supprimer ce paiement de ${fmtTND(payment.amount)} ?`)) return;
    setBusy(true);
    try { await api.delete(`/orders/${order.id}/payments/${payment.id}`); onSaved(); onClose(); }
    catch (err) { setError(errMsg(err)); }
    finally { setBusy(false); }
  };

  return (
    <Modal title="Corriger le paiement" onClose={onClose} width={420}>
      <form onSubmit={save}>
        <Field label="Montant (TND)">
          <input type="number" step="0.001" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus onFocus={(e) => e.target.select()} style={inputStyle} />
        </Field>
        <Field label="Mode">
          <select value={method} onChange={(e) => setMethod(e.target.value)} style={inputStyle}>
            {methods.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        {error && <div role="alert" style={{ color: COLORS.danger, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{error}</div>}
        <div className="flex gap-2 justify-between flex-wrap">
          <Button variant="danger" onClick={remove} disabled={busy}>Supprimer</Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={busy}>Enregistrer</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
