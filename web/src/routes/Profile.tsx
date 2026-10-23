import { useState } from 'react';
import { api } from '../lib/api';
import { Card, Avatar, Button } from '../components/Atoms';
import { COLORS, ROLE_LABELS } from '../lib/tokens';
import { useAuth } from '../store/auth';

export function ProfilePage() {
  const me = useAuth((s) => s.user);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  if (!me) return null;
  const expected = me.role === 'ADMIN' ? 6 : 4;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPin !== confirmPin) {
      setMsg({ kind: 'err', text: 'Les deux nouveaux PIN ne correspondent pas.' });
      return;
    }
    if (newPin.length !== expected) {
      setMsg({ kind: 'err', text: `Le PIN doit avoir ${expected} chiffres.` });
      return;
    }
    setBusy(true);
    try {
      await api.post('/me/change-pin', { currentPin, newPin });
      setMsg({ kind: 'ok', text: 'PIN modifié avec succès.' });
      setCurrentPin(''); setNewPin(''); setConfirmPin('');
    } catch (e: any) {
      const code = e.response?.data?.error;
      const map: Record<string, string> = {
        bad_current_pin: 'PIN actuel incorrect.',
        same_pin: 'Le nouveau PIN est identique à l\'ancien.',
        pin_length: `Le PIN doit avoir ${expected} chiffres.`,
      };
      setMsg({ kind: 'err', text: map[code] ?? 'Erreur.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card style={{ padding: 24 }}>
          <div className="flex items-center gap-3 mb-4">
            <Avatar firstName={me.firstName} lastName={me.lastName} size={56} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{me.firstName} {me.lastName}</div>
              <div style={{ fontSize: 13, color: COLORS.muted }}>{ROLE_LABELS[me.role] ?? me.role} · PIN à {expected} chiffres</div>
            </div>
          </div>
          <div style={{ background: COLORS.bg, padding: 14, borderRadius: 10, marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4 }}>SESSION</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Connecté · session valide 30 jours</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
              Tu n'as pas besoin de te reconnecter pendant la journée.
            </div>
          </div>
          <div style={{ background: COLORS.warning + '12', padding: 14, borderRadius: 10, marginTop: 12, border: `1px solid ${COLORS.warning}33` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.warning, letterSpacing: 0.4 }}>PIN OUBLIÉ ?</div>
            <div style={{ fontSize: 12, marginTop: 4, color: COLORS.text }}>
              Demande à <strong>Adel</strong> (admin) de te le réinitialiser ou de t'en attribuer un nouveau.
            </div>
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Changer mon PIN</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16 }}>
            {expected} chiffres · à garder secret.
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
              <label style={lblStyle}>PIN actuel</label>
              <input
                type="password" inputMode="numeric" pattern="\d*"
                maxLength={expected} value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                style={inputStyle} required autoComplete="off"
              />
            </div>
            <div>
              <label style={lblStyle}>Nouveau PIN ({expected} chiffres)</label>
              <input
                type="password" inputMode="numeric" pattern="\d*"
                maxLength={expected} value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                style={inputStyle} required autoComplete="off"
              />
            </div>
            <div>
              <label style={lblStyle}>Confirmer le nouveau PIN</label>
              <input
                type="password" inputMode="numeric" pattern="\d*"
                maxLength={expected} value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                style={inputStyle} required autoComplete="off"
              />
            </div>
            {msg && (
              <div style={{
                fontSize: 12, padding: 10, borderRadius: 8,
                color: msg.kind === 'ok' ? COLORS.success : COLORS.danger,
                background: (msg.kind === 'ok' ? COLORS.success : COLORS.danger) + '14',
                border: `1px solid ${msg.kind === 'ok' ? COLORS.success : COLORS.danger}33`,
              }}>
                {msg.text}
              </div>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? 'Modification…' : 'Modifier mon PIN'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

const lblStyle: React.CSSProperties = { fontSize: 12, color: COLORS.muted, fontWeight: 600, display: 'block', marginBottom: 4 };
const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 12px', borderRadius: 8,
  border: `1px solid ${COLORS.border}`, fontSize: 16, letterSpacing: 4, fontFamily: 'ui-monospace,Menlo,monospace',
};
