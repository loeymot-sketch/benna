import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, Button } from '../components/Atoms';
import { PinPad } from '../components/PinPad';
import { COLORS, fmtTND, fmtDateTime, fmtDate, fmtPhone } from '../lib/tokens';
import { getSocket } from '../lib/socket';
import { useAuth } from '../store/auth';

const METHOD_LABELS: Record<string, string> = {
  ESPECES: 'Espèces', CARTE: 'Carte', VIREMENT: 'Virement', CHEQUE: 'Chèque', D17: 'D17', EDINAR: 'Edinar', AUTRE: 'Autre',
};

// Page Caisse & CA : verrouillée à chaque visite. Le jeton déverrouillé vit uniquement en mémoire
// (jamais en localStorage) : quitter la page ou recharger = redemander le code.
export function CashPage() {
  const me = useAuth((s) => s.user)!;
  // Tant que l'admin est sur le code par défaut (0000), la saisie fait 4 chiffres.
  const pinLen = me.role === 'ADMIN' && !me.mustChangePin ? 6 : 4;
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [pinError, setPinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<any>(null);

  const lock = useCallback((why?: string) => {
    setToken(null); setData(null); setExpiresAt(0);
    if (why) setPinError(why);
  }, []);

  const unlock = async (pin: string) => {
    setBusy(true); setPinError(null);
    try {
      const r = await api.post('/finance/unlock', { pin });
      setToken(r.data.token);
      setExpiresAt(Date.now() + r.data.expiresInSec * 1000);
    } catch (e: any) {
      const err = e.response?.data;
      setPinError(err?.error === 'bad_pin' ? `Code incorrect — ${err.attemptsLeft} essai(s) restant(s).`
        : err?.error === 'locked' ? 'Compte verrouillé 30 min après trop d\'erreurs.' : 'Erreur — réessaie.');
    } finally { setBusy(false); }
  };

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await api.get('/finance/summary', { headers: { 'x-finance-token': token } });
      setData(r.data);
    } catch (e: any) {
      if (e.response?.status === 403) lock('Session verrouillée — saisis ton code.');
    }
  }, [token, lock]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!token) return;
    const sock = getSocket();
    sock.on('order.created', load); sock.on('order.updated', load);
    const t = setInterval(load, 30000);
    return () => { sock.off('order.created', load); sock.off('order.updated', load); clearInterval(t); };
  }, [token, load]);

  // Compte à rebours + verrouillage automatique
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!token) return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= expiresAt) lock('Verrouillé automatiquement — saisis ton code.');
    }, 1000);
    return () => clearInterval(t);
  }, [token, expiresAt, lock]);

  if (!token) {
    return (
      <div className="p-6 flex justify-center">
        <Card style={{ padding: 28, width: '100%', maxWidth: 380, marginTop: 24 }}>
          <div style={{ textAlign: 'center', fontSize: 34 }}>🔒</div>
          <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, marginTop: 6 }}>Caisse & chiffre d'affaires</div>
          <div style={{ textAlign: 'center', fontSize: 13, color: COLORS.muted, margin: '6px 0 18px' }}>
            {me.firstName}, ressaisis ton code ({pinLen} chiffres) pour afficher les chiffres.
          </div>
          <PinPad length={pinLen} onComplete={unlock} disabled={busy} error={pinError} />
        </Card>
      </div>
    );
  }

  if (!data) return <div className="p-6" style={{ color: COLORS.muted }}>Chargement…</div>;

  const left = Math.max(0, Math.round((expiresAt - now) / 1000));
  const maxBar = Math.max(1, ...data.days.map((d: any) => Math.max(d.revenue, d.cash)));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div style={{ fontSize: 12.5, color: COLORS.muted }}>
          🔓 Déverrouillé · se verrouille dans {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
        </div>
        <Button variant="secondary" size="sm" onClick={() => lock()}>🔒 Verrouiller maintenant</Button>
      </div>

      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
        <Kpi title="Aujourd'hui" cash={data.today.cash} revenue={data.today.revenue} accent={COLORS.success} />
        <Kpi title="7 derniers jours" cash={data.week.cash} revenue={data.week.revenue} accent={COLORS.stEnCours} />
        <Kpi title="Ce mois" cash={data.month.cash} revenue={data.month.revenue} accent={COLORS.primary} />
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4 }}>RESTE À ENCAISSER</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: data.unpaid.total > 0 ? COLORS.danger : COLORS.success }}>{fmtTND(data.unpaid.total)}</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{data.unpaid.count} commande(s) non soldée(s)</div>
        </Card>
      </div>

      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>7 derniers jours</div>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {data.days.map((d: any) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${fmtDate(d.date)} — CA ${fmtTND(d.revenue)} · encaissé ${fmtTND(d.cash)}`}>
                <div className="flex items-end gap-0.5" style={{ height: 96 }}>
                  <div style={{ width: 9, height: `${(d.revenue / maxBar) * 100}%`, minHeight: d.revenue ? 2 : 0, background: COLORS.primary, borderRadius: 3 }} />
                  <div style={{ width: 9, height: `${(d.cash / maxBar) * 100}%`, minHeight: d.cash ? 2 : 0, background: COLORS.success, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 10, color: COLORS.muted }}>{fmtDate(d.date).slice(0, 5)}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3" style={{ fontSize: 11, color: COLORS.muted }}>
            <span><span style={{ color: COLORS.primary }}>■</span> Chiffre d'affaires</span>
            <span><span style={{ color: COLORS.success }}>■</span> Encaissé</span>
          </div>
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Caisse du jour par mode de paiement</div>
          {Object.keys(data.today.byMethod).length === 0 && <div style={{ fontSize: 13, color: COLORS.muted }}>Aucun encaissement aujourd'hui.</div>}
          {Object.entries(data.today.byMethod).map(([m, amt]: [string, any]) => (
            <div key={m} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
              <span>{METHOD_LABELS[m] ?? m}</span>
              <span style={{ fontWeight: 700, color: COLORS.success }}>{fmtTND(amt)}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card className="mb-4">
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 14, fontWeight: 700 }}>
          Encaissements du jour ({data.today.count})
        </div>
        {data.today.payments.length === 0 && <div style={{ padding: 24, color: COLORS.muted, fontSize: 13 }}>Aucun encaissement aujourd'hui.</div>}
        {data.today.payments.map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 flex-wrap" style={{ padding: '12px 18px', borderBottom: `1px solid ${COLORS.border}` }}>
            <span className="pill" style={{ background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>{METHOD_LABELS[p.method] ?? p.method}</span>
            <Link to={`/orders/${p.order?.id}`} style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, color: COLORS.primary, fontWeight: 700, width: 130 }}>
              {p.order?.ticketCode}
            </Link>
            <div className="flex-1" style={{ fontSize: 13, minWidth: 120 }}>{p.order?.customer?.fullName}</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>par {p.receivedBy?.firstName}</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>{fmtDateTime(p.createdAt)}</div>
            <div style={{ fontWeight: 700 }}>{fmtTND(p.amount)}</div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 14, fontWeight: 700 }}>
          Reste à encaisser ({data.unpaid.count})
        </div>
        {data.unpaid.orders.length === 0 && <div style={{ padding: 24, color: COLORS.muted, fontSize: 13 }}>Tout est soldé 🎉</div>}
        {data.unpaid.orders.map((o: any) => (
          <div key={o.id} className="flex items-center gap-3 flex-wrap" style={{ padding: '12px 18px', borderBottom: `1px solid ${COLORS.border}` }}>
            <Link to={`/orders/${o.id}`} style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, color: COLORS.primary, fontWeight: 700, width: 130 }}>{o.ticketCode}</Link>
            <div className="flex-1" style={{ fontSize: 13, minWidth: 120 }}>{o.customer?.fullName} <span style={{ color: COLORS.muted }}>· {fmtPhone(o.customer?.phone ?? '')}</span></div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>livraison {fmtDate(o.deliveryDate)}</div>
            <div style={{ fontWeight: 700, color: COLORS.danger }}>{fmtTND(o.due)}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Kpi({ title, cash, revenue, accent }: { title: string; cash: number; revenue: number; accent: string }) {
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4 }}>{title.toUpperCase()}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: accent }}>{fmtTND(revenue)}</div>
      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>chiffre d'affaires</div>
      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>{fmtTND(cash)} <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted }}>encaissés</span></div>
    </Card>
  );
}
