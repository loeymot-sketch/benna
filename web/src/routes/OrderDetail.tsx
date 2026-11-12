import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { apiUrl } from '../lib/config';
import { shrinkImage } from '../lib/image';
import { Card, StatusPill, UrgencyDot, Button, PostTypeChip, Avatar } from '../components/Atoms';
import { COLORS, fmtTND, fmtDate, fmtDateTime, timeAgo, fmtPhone, fullName, clientName, localISODate, STATUS_LABELS } from '../lib/tokens';
import { getSocket } from '../lib/socket';

const PAYMENT_METHODS = ['ESPECES','CARTE','VIREMENT','CHEQUE','D17','EDINAR','AUTRE'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [tab, setTab] = useState<'infos' | 'attachments' | 'history' | 'payments' | 'carnet'>('infos');
  const [users, setUsers] = useState<any[]>([]);
  const [showQr, setShowQr] = useState(false);
  const navigate = useNavigate();

  const reload = () => api.get(`/orders/${id}`).then((r) => setOrder(r.data.order));

  useEffect(() => {
    if (!id) return;
    reload();
    api.get('/users').then((r) => setUsers(r.data.users));
    const sock = getSocket();
    const fn = (p: any) => { if (p.id === id) reload(); };
    sock.on('order.updated', fn);
    sock.on('order.status_changed', fn);
    const onPost = (p: any) => { if (!p.orderId || p.orderId === id) reload(); };
    sock.on('post.created', onPost);
    return () => {
      sock.off('order.updated', fn);
      sock.off('order.status_changed', fn);
      sock.off('post.created', onPost);
    };
  }, [id]);

  if (!order) return <div className="p-6 text-muted">Chargement…</div>;

  const due = Math.max(0, order.totalAmount - order.discountAmount - order.paidAmount);

  const assignTo = async (assignedToId: string | null) => {
    await api.patch(`/orders/${id}`, { assignedToId });
    reload();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>
        ← Retour
      </button>

      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 18, fontWeight: 700, color: COLORS.primary, whiteSpace: 'nowrap' }}>
              {order.ticketCode}
            </div>
            <StatusPill status={order.status} />
            <div className="flex items-center gap-1.5" style={{ fontSize: 12 }}>
              <UrgencyDot level={order.urgency} /> {order.urgency}
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{clientName(order.customer)}</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>
            {fmtPhone(order.customer?.phone) || fmtPhone(order.notifyPhone) || 'Pas de GSM'}{order.pouchNumber && ` · Pochette ${order.pouchNumber}`} · {order.shop?.name}
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontSize: 12, color: COLORS.muted }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{fmtTND(order.totalAmount)}</div>
          <div style={{ fontSize: 11, color: due > 0 ? COLORS.danger : COLORS.success, fontWeight: 600, marginTop: 2 }}>
            {due > 0 ? `Reste ${fmtTND(due)}` : '✓ Soldée'}
          </div>
        </div>
      </div>

      <StatusPanel order={order} onChange={reload} />

      {/* Quick actions */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select
          value={order.assignedToId ?? ''}
          onChange={(e) => assignTo(e.target.value || null)}
          style={{ height: 32, padding: '0 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13 }}
        >
          <option value="">Non assigné</option>
          {users.map((u) => <option key={u.id} value={u.id}>{fullName(u)} · {u.role}</option>)}
        </select>
        <Button variant="secondary" onClick={() => setShowQr(true)}>📱 Afficher le QR client</Button>
        <div className="flex-1" />
        <Button variant="secondary" onClick={() => setTab('carnet')}>📓 Ajouter au Carnet</Button>
      </div>

      {showQr && <QrModal order={order} onClose={() => setShowQr(false)} />}

      {/* Tabs */}
      <div className="flex gap-1 mb-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        {[
          { id: 'infos', label: 'Infos' },
          { id: 'payments', label: `Paiements (${order.payments?.length ?? 0})` },
          { id: 'attachments', label: `Pièces jointes (${order.attachments?.length ?? 0})` },
          { id: 'history', label: 'Historique' },
          { id: 'carnet', label: `Carnet (${order.posts?.length ?? 0})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{
              padding: '10px 14px', fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? COLORS.primary : COLORS.muted,
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.id ? `2px solid ${COLORS.primary}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'infos' && <InfoTab order={order} />}
      {tab === 'payments' && <PaymentsTab order={order} onChange={reload} />}
      {tab === 'attachments' && <AttachmentsTab order={order} onChange={reload} />}
      {tab === 'history' && <HistoryTab order={order} />}
      {tab === 'carnet' && <CarnetTab order={order} users={users} onChange={reload} />}
    </div>
  );
}

function InfoTab({ order }: { order: any }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
      <Card style={{ padding: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4 }}>DESCRIPTION</div>
        <div style={{ fontSize: 14, marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{order.description}</div>
        {order.services?.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginTop: 18 }}>SERVICES</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {order.services.map((s: any) => (
                <span key={s.serviceId} className="pill" style={{ background: COLORS.primary + '15', color: COLORS.primary, border: `1px solid ${COLORS.primary}33` }}>
                  {s.service.icon} {s.service.name}
                </span>
              ))}
            </div>
          </>
        )}
        {order.lineItems?.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginTop: 18 }}>LIGNES</div>
            <table style={{ width: '100%', marginTop: 8, fontSize: 13 }}>
              <tbody>
                {order.lineItems.map((li: any) => (
                  <tr key={li.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: 8 }}>{li.description}</td>
                    <td style={{ padding: 8, textAlign: 'right', whiteSpace: 'nowrap' }}>{li.quantity} × {fmtTND(li.unitPrice)}</td>
                    <td style={{ padding: 8, textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtTND(li.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {order.internalNotes && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginTop: 18 }}>NOTES INTERNES</div>
            <div style={{ fontSize: 13, marginTop: 6, color: COLORS.muted, fontStyle: 'italic' }}>{order.internalNotes}</div>
          </>
        )}
      </Card>

      <Card style={{ padding: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4 }}>ÉQUIPE</div>
        <div className="mt-2.5">
          <div style={{ fontSize: 12, color: COLORS.muted }}>Créé par</div>
          <div className="flex items-center gap-2 mt-1">
            <Avatar firstName={order.createdBy?.firstName ?? '?'} lastName={order.createdBy?.lastName ?? ''} size={28} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>{fullName(order.createdBy ?? {})}</div>
          </div>
        </div>
        <div className="mt-3.5">
          <div style={{ fontSize: 12, color: COLORS.muted }}>Assigné à</div>
          {order.assignedTo ? (
            <div className="flex items-center gap-2 mt-1">
              <Avatar firstName={order.assignedTo.firstName} lastName={order.assignedTo.lastName} size={28} />
              <div style={{ fontSize: 13, fontWeight: 500 }}>{fullName(order.assignedTo)}</div>
            </div>
          ) : <div style={{ fontSize: 13, color: COLORS.muted, fontStyle: 'italic', marginTop: 4 }}>Personne</div>}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginTop: 18 }}>LIVRAISON</div>
        <div style={{ fontSize: 14, marginTop: 4 }}>{fmtDate(order.deliveryDate)} {order.deliveryTime && `· ${order.deliveryTime}`}</div>
      </Card>
    </div>
  );
}

function PaymentsTab({ order, onChange }: { order: any; onChange: () => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('ESPECES');
  const due = Math.max(0, order.totalAmount - order.discountAmount - order.paidAmount);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    await api.post(`/orders/${order.id}/payments`, { amount: a, method });
    setAmount(''); onChange();
  };

  return (
    <Card style={{ padding: 18 }}>
      <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Stat label="Total" value={fmtTND(order.totalAmount)} />
        <Stat label="Payé" value={fmtTND(order.paidAmount)} color={COLORS.success} />
        <Stat label="Reste" value={fmtTND(due)} color={due > 0 ? COLORS.danger : COLORS.success} />
      </div>
      {due > 0 && (
        <form onSubmit={submit} className="flex gap-2 mb-4 flex-wrap items-end">
          <div>
            <label style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>Montant (TND)</label>
            <input
              type="number" step="0.001" value={amount} onChange={(e) => setAmount(e.target.value)} required
              style={{ display: 'block', height: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, width: 140 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>Mode</label>
            <select
              value={method} onChange={(e) => setMethod(e.target.value)}
              style={{ display: 'block', height: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }}
            >
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <Button type="submit">Encaisser</Button>
        </form>
      )}
      <div>
        {order.payments?.length === 0 && <div style={{ color: COLORS.muted, fontSize: 13 }}>Aucun paiement.</div>}
        {order.payments?.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
            <div className="flex items-center gap-3">
              <span className="pill" style={{ background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>{p.method}</span>
              <div>{fmtDateTime(p.createdAt)}</div>
              {p.receivedBy && <div style={{ color: COLORS.muted, fontSize: 12 }}>par {p.receivedBy.firstName}</div>}
            </div>
            <div style={{ fontWeight: 700 }}>{fmtTND(p.amount)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Stat({ label, value, color = COLORS.text }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: COLORS.bg, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function AttachmentsTab({ order, onChange }: { order: any; onChange: () => void }) {
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', await shrinkImage(file));
    fd.append('kind', 'REFERENCE');
    await api.post(`/orders/${order.id}/attachments`, fd);
    onChange();
    e.target.value = '';
  };

  return (
    <Card style={{ padding: 18 }}>
      <label className="inline-block cursor-pointer mb-4" style={{ padding: '8px 14px', background: COLORS.primary, color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
        + Ajouter un fichier
        <input type="file" onChange={upload} style={{ display: 'none' }} />
      </label>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {order.attachments?.length === 0 && <div style={{ gridColumn: '1 / -1', color: COLORS.muted, fontSize: 13 }}>Aucune pièce jointe.</div>}
        {order.attachments?.map((a: any) => {
          const isImg = a.mimeType?.startsWith('image/');
          return (
            <a
              key={a.id} href={apiUrl(a.url)} target="_blank" rel="noreferrer"
              style={{ display: 'block', padding: 8, border: `1px solid ${COLORS.border}`, borderRadius: 8, textDecoration: 'none', color: COLORS.text }}
            >
              {isImg ? (
                <img src={apiUrl(a.url)} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 4 }} />
              ) : (
                <div style={{ height: 110, background: COLORS.bg, borderRadius: 4, fontSize: 36 }} className="flex items-center justify-center">📄</div>
              )}
              <div style={{ fontSize: 11, marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.filename}</div>
              <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{a.kind} · {(a.size / 1024).toFixed(0)} KB</div>
            </a>
          );
        })}
      </div>
    </Card>
  );
}

function HistoryTab({ order }: { order: any }) {
  return (
    <Card style={{ padding: 18 }}>
      {order.statusHistory?.map((h: any) => (
        <div key={h.id} className="flex gap-3" style={{ padding: '10px 0', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.primary, marginTop: 6 }} />
          <div className="flex-1">
            <div style={{ fontSize: 13 }}>
              <span style={{ color: COLORS.muted }}>{h.fromStatus ?? '—'}</span> →{' '}
              <StatusPill status={h.toStatus} />
            </div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
              {fmtDateTime(h.createdAt)}
              {h.changedBy && ` · par ${h.changedBy.firstName} ${h.changedBy.lastName}`}
            </div>
            {h.comment && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, fontStyle: 'italic' }}>"{h.comment}"</div>}
          </div>
        </div>
      ))}
    </Card>
  );
}

function CarnetTab({ order, users, onChange }: { order: any; users: any[]; onChange: () => void }) {
  const [body, setBody] = useState('');
  const [type, setType] = useState('HANDOFF');
  const [recipientUserId, setRecipientUserId] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body) return;
    await api.post('/posts', {
      type, body,
      scope: recipientUserId ? 'DIRECT' : 'ALL',
      recipientUserId: recipientUserId || null,
      orderId: order.id,
    });
    setBody(''); setRecipientUserId('');
    onChange();
  };

  return (
    <Card style={{ padding: 18 }}>
      <form onSubmit={submit} className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap">
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ height: 36, padding: '0 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13 }}>
            <option value="HANDOFF">🔄 Passation</option>
            <option value="TASK">✅ Tâche</option>
            <option value="QUESTION">❓ Question</option>
            <option value="ALERT">⚠️ Alerte</option>
            <option value="NOTE">📝 Note</option>
          </select>
          <select value={recipientUserId} onChange={(e) => setRecipientUserId(e.target.value)} style={{ height: 36, padding: '0 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13 }}>
            <option value="">À toute l'équipe</option>
            {users.map((u) => <option key={u.id} value={u.id}>{fullName(u)}</option>)}
          </select>
        </div>
        <textarea
          value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Ton message…" rows={3}
          style={{ padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, resize: 'vertical' }}
        />
        <div>
          <Button type="submit">Publier dans le Carnet</Button>
        </div>
      </form>

      <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
        {order.posts?.length === 0 && <div style={{ color: COLORS.muted, fontSize: 13 }}>Aucun post sur cette commande.</div>}
        {order.posts?.map((p: any) => (
          <div key={p.id} style={{ padding: '10px 0', borderBottom: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center gap-2 mb-1">
              <PostTypeChip type={p.type} />
              <Avatar firstName={p.author.firstName} lastName={p.author.lastName} size={22} />
              <div style={{ fontSize: 12, fontWeight: 600 }}>{p.author.firstName}</div>
              {p.recipientUser && <div style={{ fontSize: 12, color: COLORS.muted }}>→ {p.recipientUser.firstName}</div>}
              <div style={{ fontSize: 11, color: COLORS.muted, marginLeft: 'auto' }}>{timeAgo(p.createdAt)}</div>
              {p.status === 'RESOLVED' && <span className="pill" style={{ background: COLORS.success + '1a', color: COLORS.success, border: `1px solid ${COLORS.success}33` }}>Résolu</span>}
            </div>
            <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{p.body}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}


// Étapes proposées en un clic (les statuts « de côté » sont dans « Autres »).
const MAIN_STEPS = ['RECUE', 'EN_COURS_DESIGN', 'EN_PRODUCTION', 'PRETE', 'LIVREE'];
const OTHER_STEPS = ['EN_ATTENTE', 'VALIDATION_CLIENT', 'EN_FINITION', 'ANNULEE'];
const NOTIFY_LABEL: Record<string, string> = { CALL: '📞 Veut être appelé', WHATSAPP: '💬 Veut un message WhatsApp' };

function toInputDate(d?: string | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : '';
}

function StatusPanel({ order, onChange }: { order: any; onChange: () => void }) {
  const [planned, setPlanned] = useState(toInputDate(order.plannedFor));
  const [note, setNote] = useState(order.plannedNote ?? '');
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editPhone, setEditPhone] = useState<string | null>(null);
  // une mise à jour venue d'un collègue ne doit pas effacer une date en cours de saisie
  useEffect(() => { if (pending) return; setPlanned(toInputDate(order.plannedFor)); setNote(order.plannedNote ?? ''); }, [order.status, order.plannedFor, order.plannedNote]);

  const needsDate = (s: string) => !['RECUE', 'LIVREE', 'ANNULEE', 'PRETE'].includes(s);
  const send = async (status: string, plannedFor: string | null, plannedNote: string | null) => {
    setBusy(true);
    try { await api.post(`/orders/${order.id}/status`, { status, plannedFor, plannedNote }); onChange(); }
    finally { setBusy(false); }
  };
  const pick = (s: string) => {
    if (s === order.status) return;
    if (needsDate(s)) { setPending(s); setPlanned(''); setNote(''); } // propose la date avant de valider
    else send(s, null, null);
  };
  const target = pending ?? order.status;
  const showPlan = needsDate(target);
  const toNotify = order.status === 'PRETE' && order.notifyMode !== 'NONE';

  const stepBtn = (s: string, small = false) => {
    const active = target === s;
    const color = STATUS_LABELS[s]?.color ?? COLORS.primary;
    return (
      <button key={s} type="button" disabled={busy} onClick={() => pick(s)} style={{
        padding: small ? '6px 10px' : '10px 16px', fontSize: small ? 12 : 14, fontWeight: 700, borderRadius: 10, cursor: 'pointer',
        background: active ? color : '#fff', color: active ? '#fff' : COLORS.text,
        border: `2px solid ${active ? color : COLORS.border}`,
      }}>{STATUS_LABELS[s]?.label ?? s}</button>
    );
  };

  return (
    <Card style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginBottom: 10 }}>ÉTAPE DE LA COMMANDE</div>
      <div className="flex gap-2 flex-wrap items-center">
        {MAIN_STEPS.map((s) => stepBtn(s))}
        <span style={{ width: 1, height: 24, background: COLORS.border, margin: '0 4px' }} />
        {OTHER_STEPS.map((s) => stepBtn(s, true))}
      </div>

      {showPlan && (
        <div className="flex gap-2 items-end flex-wrap" style={{ marginTop: 14, padding: 12, background: COLORS.bg, borderRadius: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4 }}>
              « {STATUS_LABELS[target]?.label} » — prévu pour quelle date ?
            </div>
            <div className="flex gap-1 flex-wrap">
              <input type="date" value={planned} onChange={(e) => setPlanned(e.target.value)}
                style={{ height: 36, padding: '0 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
              {[['Aujourd\'hui', 0], ['Demain', 1], ['+2 j', 2], ['+1 sem.', 7]].map(([l, n]) => (
                <Button key={l as string} type="button" size="sm" variant="secondary" onClick={() => {
                  const d = new Date(); d.setDate(d.getDate() + (n as number)); setPlanned(localISODate(d));
                }}>{l}</Button>
              ))}
            </div>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Précision (ex. après-midi)"
            style={{ height: 36, padding: '0 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, flex: 1, minWidth: 160 }} />
          <Button disabled={busy} onClick={() => send(target, planned || null, note || null)}>
            {pending ? 'Valider l\'étape' : 'Enregistrer la date'}
          </Button>
          {pending && <Button variant="ghost" onClick={() => send(pending, null, null)}>Sans date</Button>}
          {pending && <Button variant="ghost" onClick={() => setPending(null)}>Annuler</Button>}
        </div>
      )}
      {!pending && order.plannedFor && (
        <div style={{ marginTop: 10, fontSize: 13 }}>
          📅 Annoncé au client : <strong>{fmtDate(order.plannedFor)}</strong>{order.plannedNote && ` · ${order.plannedNote}`}
        </div>
      )}

      {order.notifyMode !== 'NONE' && (
        <div className="flex items-center gap-3 flex-wrap" style={{
          marginTop: 12, padding: '10px 12px', borderRadius: 10, fontSize: 13,
          background: toNotify && !order.notifiedAt ? COLORS.success + '18' : COLORS.bg,
          border: `1px solid ${toNotify && !order.notifiedAt ? COLORS.success : COLORS.border}`,
        }}>
          <div className="flex-1" style={{ minWidth: 200 }}>
            <strong>{NOTIFY_LABEL[order.notifyMode]}</strong> quand c'est prêt
            {' · '}{fmtPhone(order.notifyPhone || order.customer?.phone) || <span style={{ color: COLORS.danger }}>aucun numéro</span>}
            {editPhone === null ? (
              <button type="button" onClick={() => setEditPhone(order.notifyPhone || order.customer?.phone || '')}
                style={{ marginLeft: 8, background: 'none', border: 'none', color: COLORS.primary, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                modifier le numéro
              </button>
            ) : (
              <span className="inline-flex gap-1" style={{ marginLeft: 8 }}>
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} inputMode="tel" autoFocus aria-label="Numéro à prévenir"
                  style={{ height: 28, padding: '0 8px', borderRadius: 6, border: `1px solid ${COLORS.border}`, fontSize: 13, width: 150 }} />
                <Button size="sm" onClick={async () => { await api.patch(`/orders/${order.id}`, { notifyPhone: editPhone.trim() || null }); setEditPhone(null); onChange(); }}>OK</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditPhone(null)}>✕</Button>
              </span>
            )}
            {order.notifiedAt && <span style={{ color: COLORS.success }}> · ✓ prévenu le {fmtDateTime(order.notifiedAt)}</span>}
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>L'envoi WhatsApp automatique sera branché prochainement.</div>
          </div>
          {toNotify && !order.notifiedAt && (
            <>
              {(order.notifyPhone || order.customer?.phone) && (
                <a href={order.notifyMode === 'WHATSAPP'
                  ? `https://wa.me/${(order.notifyPhone || order.customer.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, votre commande ${order.ticketCode} est prête chez EL BENNA 📸`)}`
                  : `tel:${order.notifyPhone || order.customer.phone}`}
                  target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, textDecoration: 'none' }}>
                  {order.notifyMode === 'WHATSAPP' ? 'Ouvrir WhatsApp' : 'Appeler'}
                </a>
              )}
              <Button onClick={async () => { await api.post(`/orders/${order.id}/notified`, { done: true }); onChange(); }}>✓ Client prévenu</Button>
            </>
          )}
          {order.notifiedAt && (
            <Button variant="ghost" size="sm" onClick={async () => { await api.post(`/orders/${order.id}/notified`, { done: false }); onChange(); }}>Annuler</Button>
          )}
        </div>
      )}
    </Card>
  );
}

function QrModal({ order, onClose }: { order: any; onClose: () => void }) {
  const [qr, setQr] = useState<{ url: string; dataUrl: string } | null>(null);
  const [failed, setFailed] = useState(false);
  // Le lien contient un secret propre à la commande : il est fourni par le serveur à l'équipe seulement.
  useEffect(() => {
    api.get(`/orders/${order.id}/qr`, { params: { base: window.location.origin } }).then((r) => setQr(r.data)).catch(() => setFailed(true));
  }, [order.id]);
  const link = qr?.url ?? '';
  return (
    <div className="fixed inset-0 flex items-center justify-center" onClick={onClose} style={{ background: 'rgba(0,0,0,0.55)', zIndex: 100 }}>
      <Card style={{ padding: 28, width: 420, maxWidth: '92vw', textAlign: 'center' }}>
        <div onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>Scanne pour suivre ta commande</div>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 20, fontWeight: 800, color: COLORS.primary, margin: '6px 0 14px' }}>{order.ticketCode}</div>
          {qr ? <img src={qr.dataUrl} alt={`QR de suivi de la commande ${order.ticketCode}`} style={{ width: 300, height: 300, maxWidth: '100%', margin: '0 auto', imageRendering: 'pixelated' }} />
            : <div style={{ width: 300, height: 300, maxWidth: '100%', margin: '0 auto', color: COLORS.muted, fontSize: 13 }} className="flex items-center justify-center">{failed ? 'QR indisponible, réessaie.' : 'Génération du QR…'}</div>}
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, lineHeight: 1.5 }}>
            Le client voit en direct l'état de sa commande, la date prévue, le prix et le reste à payer.
          </div>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            <Button variant="secondary" disabled={!qr} onClick={() => navigator.clipboard?.writeText(link)}>Copier le lien</Button>
            <Button variant="secondary" disabled={!qr} onClick={() => window.open(link, '_blank')}>Voir la page client</Button>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
