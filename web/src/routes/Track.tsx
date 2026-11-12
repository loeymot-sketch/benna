import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { COLORS, STATUS_LABELS, fmtDate, fmtTND } from '../lib/tokens';
import { Logo } from '../components/Atoms';

const STEPS = [
  { id: 'RECUE', label: 'Reçue' },
  { id: 'EN_COURS_DESIGN', label: 'Design' },
  { id: 'EN_PRODUCTION', label: 'Production' },
  { id: 'PRETE', label: 'Prête' },
  { id: 'LIVREE', label: 'Livrée' },
];
// Statuts « intermédiaires » : on les rattache à l'étape visible la plus proche pour que la progression ne retombe pas à zéro.
const STEP_OF: Record<string, string> = { EN_ATTENTE: 'RECUE', VALIDATION_CLIENT: 'EN_COURS_DESIGN', EN_FINITION: 'EN_PRODUCTION' };

export function TrackPage() {
  const { code } = useParams<{ code: string }>();
  const [sp] = useSearchParams();
  const key = sp.get('k') ?? '';
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // « Introuvable » seulement sur un vrai 404 : une coupure réseau garde les données affichées et réessaie au prochain tour.
  const load = () => api.get(`/track/${code}`, { params: key ? { k: key } : {} })
    .then((r) => { setData(r.data); setError(null); })
    .catch((e) => { if (e?.response?.status === 404) setError('not_found'); });
  // QR dynamique : la page se met à jour toute seule (toutes les 15 s)
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const setNotify = async (mode: 'NONE' | 'CALL' | 'WHATSAPP') => {
    setNotifyError(null); setSaving(true);
    try {
      await api.post(`/track/${code}/notify`, { mode, phone: phone || null, key });
      await load();
    } catch (e: any) {
      const c = e.response?.data?.error;
      if (c === 'order_closed') { await load(); setSaving(false); return; } // la commande vient de passer à « prête » : on rafraîchit
      setNotifyError(c === 'phone_required' ? 'Ajoute ton numéro pour que nous puissions te prévenir.' : c === 'invalid_phone' ? 'Ce numéro semble incomplet.' : 'Une erreur est survenue, réessaie.');
    } finally { setSaving(false); }
  };

  if (error) return (
    <div className="h-full flex items-center justify-center p-6" style={{ background: COLORS.bg, fontFamily: 'Inter' }}>
      <div className="text-center">
        <div style={{ fontSize: 48 }}>🤔</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Commande introuvable</div>
        <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Vérifie le code ticket sur ton reçu.</div>
      </div>
    </div>
  );
  if (!data) return <div className="h-full flex items-center justify-center" style={{ color: COLORS.muted }}>Chargement…</div>;

  const currentStepIndex = STEPS.findIndex((s) => s.id === (STEP_OF[data.status] ?? data.status));
  const isCancelled = data.status === 'ANNULEE';
  const limited = !!data.limited;
  const isReady = data.status === 'PRETE';
  const isDelivered = data.status === 'LIVREE';

  return (
    <div className="min-h-full" style={{ background: COLORS.bg, fontFamily: 'Inter' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 20 }}>
        <div className="flex justify-center pt-4 pb-6"><Logo size={40} /></div>

        <div style={{
          background: isReady ? `linear-gradient(135deg, ${COLORS.success}, #059669)` :
                       isDelivered ? `linear-gradient(135deg, ${COLORS.muted}, ${COLORS.text})` :
                       `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
          color: '#fff', padding: 24, borderRadius: 16,
          marginBottom: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>{data.customerFirstName ? `Bonjour ${data.customerFirstName}` : 'Bonjour'}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
            {isCancelled ? 'Commande annulée' :
             isReady ? '🎉 Votre commande est PRÊTE' :
             isDelivered ? '✓ Commande livrée' :
             'Votre commande est en cours'}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85, marginTop: 8, fontFamily: 'ui-monospace,Menlo,monospace' }}>
            {data.ticketCode}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 16 }}>SUIVI DE PRODUCTION</div>
          <div className="flex flex-col gap-1">
            {STEPS.map((step, i) => {
              const done = i <= currentStepIndex && data.status !== 'ANNULEE';
              const current = i === currentStepIndex;
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 999,
                      background: done ? (current ? COLORS.primary : COLORS.success) : COLORS.border,
                      color: '#fff', fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {done && !current ? '✓' : (i + 1)}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ width: 2, height: 20, background: i < currentStepIndex ? COLORS.success : COLORS.border, marginTop: 2, marginBottom: 2 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: current ? 700 : 500, color: done ? COLORS.text : COLORS.muted, padding: '4px 0' }}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {data.plannedFor && !isReady && !isDelivered && (
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, border: `1px solid ${COLORS.primary}33` }}>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Étape « {STATUS_LABELS[data.status]?.label ?? data.status} »</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>📅 Prévue pour le {fmtDate(data.plannedFor)}{data.plannedNote && ` · ${data.plannedNote}`}</div>
          </div>
        )}

        {/* Info card */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, marginBottom: 16 }}>
          <div className="flex justify-between items-center mb-3">
            <div style={{ fontSize: 12, color: COLORS.muted }}>Date de livraison prévue</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtDate(data.deliveryDate)} {data.deliveryTime && `· ${data.deliveryTime}`}</div>
          </div>
          {!limited && (<>
          <div className="flex justify-between items-center mb-3" style={{ paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Prix de la commande</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtTND(data.totalAmount - (data.discountAmount ?? 0))}</div>
          </div>
          {data.paidAmount > 0 && (
            <div className="flex justify-between items-center mb-3">
              <div style={{ fontSize: 12, color: COLORS.muted }}>Déjà réglé</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.success }}>{fmtTND(data.paidAmount)}</div>
            </div>
          )}
          {data.remainingAmount <= 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.success, paddingTop: 4 }}>✓ Commande entièrement réglée</div>
          )}
          {data.remainingAmount > 0 && (
            <div className="flex justify-between items-center" style={{ paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 12, color: COLORS.muted }}>Reste à régler à la livraison</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.warning }}>{fmtTND(data.remainingAmount)}</div>
            </div>
          )}
          </>)}
        </div>

        {!isDelivered && !isCancelled && !limited && (
          <div style={{ background: '#fff', padding: 20, borderRadius: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 12 }}>
              {isReady ? 'VOTRE COMMANDE EST PRÊTE' : 'ÊTRE PRÉVENU QUAND C\'EST PRÊT'}
            </div>
            {!isReady && (
              <>
                {!data.hasPhone && (
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="Ton numéro (ex. 28 555 123)"
                    style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 16, marginBottom: 10 }} />
                )}
                <div className="flex flex-col gap-2">
                  {([['WHATSAPP', '💬 Merci de me notifier sur WhatsApp'], ['CALL', '📞 Merci de m\'appeler quand c\'est prêt'], ['NONE', 'Pas besoin, je passerai voir']] as const).map(([m, l]) => (
                    <button key={m} disabled={saving} onClick={() => setNotify(m)} style={{
                      height: 46, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: '0 14px',
                      background: data.notifyMode === m ? COLORS.primary : '#fff', color: data.notifyMode === m ? '#fff' : COLORS.text,
                      border: `2px solid ${data.notifyMode === m ? COLORS.primary : COLORS.border}`,
                    }}>{data.notifyMode === m ? '✓ ' : ''}{l}</button>
                  ))}
                </div>
                {notifyError && <div style={{ color: COLORS.danger, fontSize: 12, marginTop: 8 }}>{notifyError}</div>}
                {data.notifyMode !== 'NONE' && !data.hasPhone && !notifyError && (
                  <div style={{ fontSize: 12, color: COLORS.warning, marginTop: 10, fontWeight: 600 }}>
                    Il manque ton numéro : saisis-le ci-dessus, puis touche de nouveau ton choix.
                  </div>
                )}
                {data.notifyMode !== 'NONE' && data.hasPhone && (
                  <div style={{ fontSize: 12, color: COLORS.success, marginTop: 10, fontWeight: 600 }}>
                    C'est noté : nous vous préviendrons {data.notifyMode === 'WHATSAPP' ? 'sur WhatsApp' : 'par téléphone'} dès que la commande est prête.
                  </div>
                )}
              </>
            )}
            {isReady && <div style={{ fontSize: 13 }}>Vous pouvez passer la récupérer en boutique.</div>}
          </div>
        )}

        {limited && !isCancelled && (
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, fontSize: 13, color: COLORS.muted, textAlign: 'center' }}>
            Pour voir le prix et choisir comment être prévenu, scanne le QR de ton reçu.
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: COLORS.muted, padding: 16 }}>
          Labo Photo Numérique EL BENNA · Djerba<br />
          Boutique 1 (75 650 865) · Boutique 2 (75 623 681)
        </div>
      </div>
    </div>
  );
}
