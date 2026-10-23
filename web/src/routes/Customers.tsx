import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, StatusPill, Button } from '../components/Atoms';
import { COLORS, fmtTND, fmtDate, fmtPhone } from '../lib/tokens';

export function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => api.get('/customers', { params: q ? { q } : {} }).then((r) => setCustomers(r.data.customers)), 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="p-6">
      <input
        placeholder="Rechercher (nom, GSM, email)…"
        value={q} onChange={(e) => setQ(e.target.value)}
        style={{ width: 360, height: 38, padding: '0 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, marginBottom: 16 }}
      />
      <Card>
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead style={{ background: COLORS.bg }}>
            <tr>
              {['Nom', 'GSM', 'Email', 'Tags', 'Commandes', 'Inscrit'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.3, textTransform: 'uppercase', borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} onClick={() => navigate(`/customers/${c.id}`)} className="cursor-pointer hover:bg-bg" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{c.fullName}</td>
                <td style={{ padding: 12, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtPhone(c.phone)}</td>
                <td style={{ padding: 12, color: COLORS.muted }}>{c.email ?? '—'}</td>
                <td style={{ padding: 12 }}>
                  {(JSON.parse(c.tags ?? '[]') as string[]).map((t) => (
                    <span key={t} className="pill mr-1" style={{ background: COLORS.warning + '1a', color: COLORS.warning, border: `1px solid ${COLORS.warning}33` }}>{t}</span>
                  ))}
                </td>
                <td style={{ padding: 12 }}>{c._count?.orders ?? 0}</td>
                <td style={{ padding: 12, color: COLORS.muted }}>{fmtDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/customers/${id}`).then((r) => setData(r.data.customer));
  }, [id]);

  if (!data) return <div className="p-6 text-muted">Chargement…</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>
        ← Retour
      </button>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{data.fullName}</div>
      <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>{fmtPhone(data.phone)} {data.email && `· ${data.email}`}</div>

      <Card>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 14, fontWeight: 700 }}>
          Historique de commandes ({data.orders.length})
        </div>
        {data.orders.length === 0 && <div style={{ padding: 24, color: COLORS.muted, fontSize: 13 }}>Aucune commande.</div>}
        {data.orders.map((o: any) => (
          <div key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="cursor-pointer hover:bg-bg flex items-center gap-4" style={{ padding: '12px 18px', borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, fontWeight: 700, color: COLORS.primary, width: 130 }}>{o.ticketCode}</div>
            <div style={{ flex: 1, fontSize: 13 }}>{fmtTND(o.totalAmount)} · livraison {fmtDate(o.deliveryDate)}</div>
            <StatusPill status={o.status} />
          </div>
        ))}
      </Card>
    </div>
  );
}
