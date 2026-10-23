import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, StatusPill, UrgencyDot, Button } from '../components/Atoms';
import { COLORS, fmtTND, fmtDate, fmtPhone } from '../lib/tokens';
import { getSocket } from '../lib/socket';

const STATUS_FILTERS = [
  { id: 'all', label: 'Toutes', value: '' },
  { id: 'open', label: 'Ouvertes', value: 'RECUE,EN_ATTENTE,EN_COURS_DESIGN,VALIDATION_CLIENT,EN_PRODUCTION,EN_FINITION,PRETE' },
  { id: 'design', label: 'Design', value: 'EN_COURS_DESIGN,VALIDATION_CLIENT' },
  { id: 'production', label: 'Production', value: 'EN_PRODUCTION,EN_FINITION' },
  { id: 'ready', label: 'Prêtes', value: 'PRETE' },
  { id: 'delivered', label: 'Livrées', value: 'LIVREE' },
];

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState(STATUS_FILTERS[1]);
  const [q, setQ] = useState('');
  const [sp, setSp] = useSearchParams();
  const mine = sp.get('mine') === '1';
  const navigate = useNavigate();

  const load = () => {
    const params: any = { limit: 200 };
    if (filter.value) params.status = filter.value;
    if (q) params.q = q;
    if (mine) params.mine = true;
    api.get('/orders', { params }).then((r) => setOrders(r.data.orders));
  };
  // Les écouteurs temps réel sont posés une seule fois : ils doivent appeler la version courante de load().
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(load, [filter, q, mine]);

  useEffect(() => {
    const sock = getSocket();
    const fn = () => loadRef.current();
    sock.on('order.created', fn);
    sock.on('order.updated', fn);
    sock.on('order.status_changed', fn);
    sock.on('order.deleted', fn);
    return () => {
      sock.off('order.created', fn); sock.off('order.updated', fn);
      sock.off('order.status_changed', fn); sock.off('order.deleted', fn);
    };
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button
          onClick={() => setSp(mine ? {} : { mine: '1' })}
          style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: mine ? COLORS.accent : '#fff', color: mine ? '#fff' : COLORS.text,
            border: `1px solid ${mine ? COLORS.accent : COLORS.border}`, cursor: 'pointer',
          }}
        >
          👤 Mes commandes
        </button>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id} onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: filter.id === f.id ? COLORS.primary : '#fff',
              color: filter.id === f.id ? '#fff' : COLORS.text,
              border: `1px solid ${filter.id === f.id ? COLORS.primary : COLORS.border}`,
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
        <input
          placeholder="Rechercher (ticket, client, GSM, pochette)…"
          value={q} onChange={(e) => setQ(e.target.value)}
          style={{
            flex: 1, height: 36, padding: '0 14px', borderRadius: 8,
            border: `1px solid ${COLORS.border}`, fontSize: 13, minWidth: 240, maxWidth: 360,
          }}
        />
      </div>

      <Card style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: 13, minWidth: 1100, width: '100%' }}>
          <thead style={{ background: COLORS.bg }}>
            <tr>
              {['Ticket', 'Client', 'GSM', 'Description', 'Total', 'Payé', 'Statut', 'Urgence', 'Livraison', ''].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.3, textTransform: 'uppercase', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: COLORS.muted }}>Aucune commande</td></tr>
            )}
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => navigate(`/orders/${o.id}`)}
                className="cursor-pointer hover:bg-bg"
                style={{ borderBottom: `1px solid ${COLORS.border}` }}
              >
                <td style={{ padding: '12px', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, fontWeight: 700, color: COLORS.primary, whiteSpace: 'nowrap' }}>
                  {o.ticketCode}
                  {o.pouchNumber && <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 500 }}>Pochette {o.pouchNumber}</div>}
                </td>
                <td style={{ padding: '12px' }}>{o.customer?.fullName}</td>
                <td style={{ padding: '12px', color: COLORS.muted, fontSize: 12, whiteSpace: 'nowrap' }}>{fmtPhone(o.customer?.phone)}</td>
                <td style={{ padding: '12px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {o.description}
                </td>
                <td style={{ padding: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtTND(o.totalAmount)}</td>
                <td style={{ padding: '12px', fontSize: 12, color: o.paymentStatus === 'PAYE' ? COLORS.success : (o.paymentStatus === 'IMPAYE' ? COLORS.danger : COLORS.warning), fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {fmtTND(o.paidAmount)}
                </td>
                <td style={{ padding: '12px' }}><StatusPill status={o.status} /></td>
                <td style={{ padding: '12px' }}>
                  <div className="flex items-center gap-1.5" style={{ fontSize: 11 }}>
                    <UrgencyDot level={o.urgency} /> {o.urgency}
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                  {fmtDate(o.deliveryDate)} {o.deliveryTime && `· ${o.deliveryTime}`}
                </td>
                <td style={{ padding: '12px' }}>
                  <Link to={`/orders/${o.id}`} style={{ color: COLORS.primary, fontWeight: 600, fontSize: 12 }}>→</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
