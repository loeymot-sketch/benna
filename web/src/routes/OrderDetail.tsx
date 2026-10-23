import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { apiUrl } from '../lib/config';
import { shrinkImage } from '../lib/image';
import { Card, StatusPill, UrgencyDot, Button, PostTypeChip, Avatar } from '../components/Atoms';
import { COLORS, fmtTND, fmtDate, fmtDateTime, timeAgo, fmtPhone } from '../lib/tokens';
import { getSocket } from '../lib/socket';

const STATUS_OPTIONS = [
  'RECUE','EN_ATTENTE','EN_COURS_DESIGN','VALIDATION_CLIENT','EN_PRODUCTION','EN_FINITION','PRETE','LIVREE','ANNULEE',
];

const PAYMENT_METHODS = ['ESPECES','CARTE','VIREMENT','CHEQUE','D17','EDINAR','AUTRE'];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [tab, setTab] = useState<'infos' | 'attachments' | 'history' | 'payments' | 'carnet'>('infos');
  const [users, setUsers] = useState<any[]>([]);
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

  const changeStatus = async (status: string) => {
    await api.post(`/orders/${id}/status`, { status });
    reload();
  };

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
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{order.customer?.fullName}</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>
            {fmtPhone(order.customer?.phone)}{order.pouchNumber && ` · Pochette ${order.pouchNumber}`} · {order.shop?.name}
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

      {/* Quick actions */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select
          value={order.status}
          onChange={(e) => changeStatus(e.target.value)}
          style={{ height: 32, padding: '0 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13 }}
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={order.assignedToId ?? ''}
          onChange={(e) => assignTo(e.target.value || null)}
          style={{ height: 32, padding: '0 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13 }}
        >
          <option value="">Non assigné</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} · {u.role}</option>)}
        </select>
        <a
          href={apiUrl(`/api/track/${order.ticketCode}/qr.png`)}
          target="_blank" rel="noreferrer"
          style={{ fontSize: 12, color: COLORS.primary, textDecoration: 'none' }}
        >
          📱 QR de suivi
        </a>
        <a
          href={`/track/${order.ticketCode}`}
          target="_blank" rel="noreferrer"
          style={{ fontSize: 12, color: COLORS.primary, textDecoration: 'none' }}
        >
          🔗 Page publique
        </a>
        <div className="flex-1" />
        <Button variant="secondary" onClick={() => setTab('carnet')}>📓 Ajouter au Carnet</Button>
        {order.status !== 'PRETE' && order.status !== 'LIVREE' && (
          <Button variant="primary" onClick={() => changeStatus('PRETE')}>Marquer prête</Button>
        )}
      </div>

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
            <div style={{ fontSize: 13, fontWeight: 500 }}>{order.createdBy?.firstName} {order.createdBy?.lastName}</div>
          </div>
        </div>
        <div className="mt-3.5">
          <div style={{ fontSize: 12, color: COLORS.muted }}>Assigné à</div>
          {order.assignedTo ? (
            <div className="flex items-center gap-2 mt-1">
              <Avatar firstName={order.assignedTo.firstName} lastName={order.assignedTo.lastName} size={28} />
              <div style={{ fontSize: 13, fontWeight: 500 }}>{order.assignedTo.firstName} {order.assignedTo.lastName}</div>
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
            {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
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
