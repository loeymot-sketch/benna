import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, StatusPill, UrgencyDot } from '../components/Atoms';
import { COLORS, fmtDate, fullName } from '../lib/tokens';
import { useAuth } from '../store/auth';
import { getSocket } from '../lib/socket';

type DashData = {
  counters: {
    urgent: number; dueToday: number; dueTomorrow: number;
    late: number; openCount: number;
  };
  statusBreakdown: { status: string; _count: number }[];
};

export function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [mine, setMine] = useState<any[]>([]);
  const [inbox, setInbox] = useState(0);
  const me = useAuth((s) => s.user);
  const navigate = useNavigate();

  const reload = () => {
    api.get('/dashboard').then((r) => setData(r.data));
    api.get('/orders?limit=10').then((r) => setRecent(r.data.orders));
    api.get('/orders?mine=true&limit=50').then((r) =>
      setMine(r.data.orders.filter((o: any) => !['LIVREE', 'ANNULEE'].includes(o.status))));
    api.get('/me/inbox-count').then((r) => setInbox(r.data.count));
  };

  useEffect(() => {
    reload();
    const sock = getSocket();
    const onChange = () => reload();
    sock.on('order.created', onChange);
    sock.on('order.updated', onChange);
    sock.on('order.status_changed', onChange);
    sock.on('post.created', onChange);
    sock.on('post.resolved', onChange);
    return () => {
      sock.off('post.created', onChange);
      sock.off('post.resolved', onChange);
      sock.off('order.created', onChange);
      sock.off('order.updated', onChange);
      sock.off('order.status_changed', onChange);
    };
  }, []);

  if (!data) return <div className="p-6 text-muted">Chargement…</div>;

  const c = data.counters;

  return (
    <div className="p-6">
      <Card style={{ padding: 18, marginBottom: 16 }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: mine.length ? 10 : 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Bonjour {me ? fullName(me) : ''} 👋</div>
          <div className="flex gap-2 flex-wrap">
            <span onClick={() => navigate('/carnet/inbox')} className="cursor-pointer pill"
              style={{ background: inbox ? COLORS.accent : COLORS.bg, color: inbox ? '#fff' : COLORS.muted, border: `1px solid ${inbox ? COLORS.accent : COLORS.border}`, padding: '5px 12px', fontSize: 12.5 }}>
              📥 {inbox ? `${inbox} message(s) / passation(s) pour moi` : 'Rien à traiter dans le Carnet'}
            </span>
            <span onClick={() => navigate('/orders?mine=1')} className="cursor-pointer pill"
              style={{ background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: '5px 12px', fontSize: 12.5 }}>
              📋 {mine.length} commande(s) qui me sont assignées
            </span>
          </div>
        </div>
        {mine.slice(0, 5).map((o) => (
          <div key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="flex items-center gap-3 cursor-pointer hover:bg-bg"
            style={{ padding: '8px 4px', borderTop: `1px solid ${COLORS.border}` }}>
            <UrgencyDot level={o.urgency} />
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, fontWeight: 700, color: COLORS.primary, width: 130 }}>{o.ticketCode}</div>
            <div className="flex-1 min-w-0" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.customer?.fullName} · {o.description.slice(0, 50)}</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>{fmtDate(o.deliveryDate)}</div>
            <StatusPill status={o.status} />
          </div>
        ))}
      </Card>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <StatCard title="Commandes urgentes" value={c.urgent} hint="Express + urgent · ouvertes" color={COLORS.danger} icon="🔴" />
        <StatCard title="À livrer aujourd'hui" value={c.dueToday} hint="Sur la journée" color={COLORS.warning} icon="⏰" />
        <StatCard title="À livrer demain" value={c.dueTomorrow} hint="Anticipation" color={COLORS.stEnCours} icon="📅" />
        <StatCard title="En retard" value={c.late} hint="À rattraper" color={COLORS.danger} icon="🚨" />
        <StatCard title="Commandes ouvertes" value={c.openCount} hint="Hors livrées / annulées" color={COLORS.primary} icon="📋" />
      </div>

      <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <Card>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Activité récente</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>10 dernières commandes</div>
          </div>
          <div>
            {recent.length === 0 && <div style={{ padding: 24, color: COLORS.muted }}>Aucune commande pour l'instant.</div>}
            {recent.map((o) => (
              <div
                key={o.id}
                onClick={() => navigate(`/orders/${o.id}`)}
                className="flex items-center gap-3 cursor-pointer hover:bg-bg"
                style={{ padding: '12px 18px', borderBottom: `1px solid ${COLORS.border}` }}
              >
                <UrgencyDot level={o.urgency} />
                <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, fontWeight: 700, color: COLORS.primary, width: 130 }}>
                  {o.ticketCode}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {o.customer?.fullName}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {o.description.slice(0, 80)}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, whiteSpace: 'nowrap' }}>{fmtDate(o.deliveryDate)}</div>
                <StatusPill status={o.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Répartition par statut</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Toutes commandes</div>
          </div>
          <div style={{ padding: 18 }}>
            {data.statusBreakdown.map((s) => (
              <div key={s.status} className="flex items-center gap-3 mb-2">
                <StatusPill status={s.status} />
                <div className="flex-1" style={{ height: 8, background: COLORS.bg, borderRadius: 999 }}>
                  <div
                    style={{
                      height: '100%', width: `${Math.min(100, s._count * 10)}%`,
                      background: COLORS.primary, borderRadius: 999, opacity: 0.7,
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, width: 24, textAlign: 'right' }}>{s._count}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, hint, color, icon }: { title: string; value: string | number; hint?: string; color: string; icon: string }) {
  return (
    <Card style={{ padding: 18 }}>
      <div className="flex items-start justify-between">
        <div style={{ fontSize: 24 }}>{icon}</div>
        <div style={{ width: 8, height: 8, borderRadius: 999, background: color, marginTop: 8 }} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, marginTop: 8, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginTop: 4 }}>{title}</div>
      {hint && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{hint}</div>}
    </Card>
  );
}
