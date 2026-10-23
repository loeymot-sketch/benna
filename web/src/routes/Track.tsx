import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

export function TrackPage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/track/${code}`).then((r) => setData(r.data)).catch(() => setError('not_found'));
  }, [code]);

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

  const currentStepIndex = STEPS.findIndex((s) => s.id === data.status);
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
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>Bonjour {data.customerFirstName}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
            {isReady ? '🎉 Votre commande est PRÊTE' :
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

        {/* Info card */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 16, marginBottom: 16 }}>
          <div className="flex justify-between items-center mb-3">
            <div style={{ fontSize: 12, color: COLORS.muted }}>Date de livraison prévue</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtDate(data.deliveryDate)} {data.deliveryTime && `· ${data.deliveryTime}`}</div>
          </div>
          {data.remainingAmount > 0 && (
            <div className="flex justify-between items-center" style={{ paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 12, color: COLORS.muted }}>Reste à régler à la livraison</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.warning }}>{fmtTND(data.remainingAmount)}</div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: COLORS.muted, padding: 16 }}>
          Labo Photo Numérique EL BENNA · Djerba<br />
          Boutique 1 (75 650 865) · Boutique 2 (75 623 681)
        </div>
      </div>
    </div>
  );
}
