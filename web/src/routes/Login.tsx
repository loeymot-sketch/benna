import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { COLORS, ROLE_LABELS, initials } from '../lib/tokens';
import { Logo } from '../components/Atoms';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';

type UserSummary = {
  id: string; firstName: string; lastName: string; role: string;
  shopId: string | null; pinSet: boolean; mustChangePin?: boolean; avatar?: string | null;
};

export function LoginPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [picked, setPicked] = useState<UserSummary | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [setupPin2, setSetupPin2] = useState('');
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const setSession = useAuth((s) => s.setSession);
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/users').then((r) => setUsers(r.data.users)).catch(() => {});
  }, []);

  // Clavier physique (PC de la réception) : chiffres, Retour arrière, Échap
  const pressRef = useRef<(k: string) => void>(() => {});
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) pressRef.current(e.key);
      else if (e.key === 'Backspace') pressRef.current('back');
      else if (e.key === 'Escape') pressRef.current('C');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (token) return <Navigate to="/" replace />;

  // Code par défaut (0000) = 4 chiffres pour tous ; le code personnel d'un admin fait 6 chiffres.
  // En mode création de code (setupMode) c'est toujours la longueur du code personnel.
  const expectedPinLen = picked?.role === 'ADMIN' && (setupMode || !picked.mustChangePin) ? 6 : 4;

  const onPress = (key: string) => {
    setError(null);
    if (key === 'back') {
      if (setupStep === 2) setSetupPin2((p) => p.slice(0, -1));
      else setPin((p) => p.slice(0, -1));
      return;
    }
    if (key === 'C') {
      if (setupStep === 2) setSetupPin2('');
      else setPin('');
      return;
    }
    // Mises à jour fonctionnelles : une frappe rapide au clavier ne doit perdre aucun chiffre.
    if (setupStep === 2) {
      setSetupPin2((p) => (p.length < expectedPinLen ? p + key : p));
    } else {
      setPin((p) => (p.length < expectedPinLen ? p + key : p));
    }
  };

  pressRef.current = onPress;

  // Auto-submit when full
  useEffect(() => {
    if (!picked) return;
    if (setupMode) {
      if (setupStep === 1 && pin.length === expectedPinLen) {
        setSetupStep(2);
      } else if (setupStep === 2 && setupPin2.length === expectedPinLen) {
        if (pin !== setupPin2) {
          setError('Les codes ne correspondent pas');
          setSetupStep(1);
          setPin(''); setSetupPin2('');
          return;
        }
        api.post('/auth/setup-pin', { userId: picked.id, pin })
          .then(async () => {
            const r = await api.post('/auth/login', { userId: picked.id, pin });
            setSession(r.data.user, r.data.token);
            navigate('/');
          })
          .catch((e) => setError(e.response?.data?.error ?? 'Erreur'));
      }
    } else {
      if (pin.length === expectedPinLen) {
        api.post('/auth/login', { userId: picked.id, pin })
          .then((r) => { setSession(r.data.user, r.data.token); navigate('/'); })
          .catch((e) => {
            if (e.response?.data?.error === 'pin_not_set') {
              setSetupMode(true); setSetupStep(1); setPin('');
              setError('Première connexion : choisis ton code PIN.');
            } else if (e.response?.data?.error === 'bad_pin') {
              setError(`Code incorrect. ${e.response.data.attemptsLeft} essais restants.`);
              setPin('');
            } else if (e.response?.data?.error === 'locked') {
              setError('Compte verrouillé — voir admin.');
              setPin('');
            } else {
              setError('Erreur de connexion');
              setPin('');
            }
          });
      }
    }
  }, [pin, setupPin2, setupStep]);

  if (!picked) return <UserPicker users={users} onPick={(u) => {
    setPicked(u);
    setSetupMode(!u.pinSet);
    setError(u.pinSet ? null : 'Première connexion : choisis ton code PIN.');
  }} />;

  const dotsValue = setupStep === 2 ? setupPin2 : pin;
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="h-full flex" style={{ background: COLORS.bg, flexDirection: isNarrow ? 'column' : 'row' }}>
      {/* Branding panel — full on desktop, slim header on mobile */}
      {!isNarrow ? (
        <div
          style={{
            flex: '1 1 0', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
            color: '#fff', padding: 48,
          }}
          className="flex flex-col justify-between"
        >
          <Logo size={36} />
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>
              Le Carnet d'équipe<br />numérique du labo.
            </div>
            <div style={{ marginTop: 16, fontSize: 14, color: '#cbd5e1', maxWidth: 380 }}>
              Pochettes papier scannées par IA, kanban temps-réel, communication structurée — tout ce qu'il faut pour zéro commande perdue.
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            v1.0 · Boutique 1 (Av. Bourguiba) · Boutique 2 (Place Ouled Haffouz)
          </div>
        </div>
      ) : (
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
            color: '#fff', padding: '20px 16px',
          }}
          className="flex items-center justify-center flex-shrink-0"
        >
          <Logo size={32} />
        </div>
      )}

      {/* Keypad column */}
      <div className="flex flex-col items-center justify-center flex-1" style={{ flex: isNarrow ? '1 1 0' : '0 0 480px', padding: isNarrow ? 24 : 48 }}>
        <button
          onClick={() => { setPicked(null); setPin(''); setSetupPin2(''); setError(null); setSetupMode(false); setSetupStep(1); }}
          style={{ alignSelf: 'flex-start', color: COLORS.muted, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 24 }}
        >
          ← Changer d'utilisateur
        </button>
        <div className="flex flex-col items-center gap-3">
          <div
            style={{
              width: 72, height: 72, borderRadius: 999,
              background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
              color: '#fff', fontWeight: 800, fontSize: 26,
            }}
            className="flex items-center justify-center"
          >
            {initials(picked.firstName, picked.lastName)}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{picked.firstName} {picked.lastName}</div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: -4 }}>
            {ROLE_LABELS[picked.role] ?? picked.role} · PIN à {expectedPinLen} chiffres
          </div>
          {setupMode && (
            <div style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>
              {setupStep === 1 ? 'Choisis ton PIN' : 'Confirme ton PIN'}
            </div>
          )}
        </div>

        {/* PIN dots */}
        <div className="flex gap-2.5 my-8">
          {Array.from({ length: expectedPinLen }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 16, height: 16, borderRadius: 999,
                background: i < dotsValue.length ? COLORS.primary : 'transparent',
                border: `2px solid ${i < dotsValue.length ? COLORS.primary : COLORS.borderStrong}`,
                transition: 'all 100ms',
              }}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3" style={{ width: 280 }}>
          {['1','2','3','4','5','6','7','8','9','C','0','back'].map((k) => (
            <button
              key={k}
              onClick={() => onPress(k)}
              style={{
                height: 72, fontSize: 22, fontWeight: 600,
                borderRadius: 12, border: `1px solid ${COLORS.border}`,
                background: COLORS.panel, cursor: 'pointer',
                color: k === 'C' ? COLORS.muted : (k === 'back' ? COLORS.muted : COLORS.text),
              }}
            >
              {k === 'back' ? '⌫' : k}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ marginTop: 18, color: COLORS.danger, fontSize: 13, fontWeight: 500, textAlign: 'center', maxWidth: 280 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function UserPicker({ users, onPick }: { users: UserSummary[]; onPick: (u: UserSummary) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center" style={{ background: COLORS.bg, padding: 32 }}>
      <Logo size={36} />
      <div style={{ marginTop: 24, fontSize: 22, fontWeight: 700 }}>Qui es-tu ?</div>
      <div style={{ marginTop: 6, fontSize: 13, color: COLORS.muted }}>Sélectionne ton profil pour saisir ton PIN.</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-8" style={{ maxWidth: 720, padding: '0 16px' }}>
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => onPick(u)}
            className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
            style={{
              padding: 18, background: COLORS.panel, border: `1px solid ${COLORS.border}`,
              borderRadius: 14, width: '100%', minWidth: 0,
            }}
          >
            <div
              style={{
                width: 56, height: 56, borderRadius: 999,
                background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
                color: '#fff', fontWeight: 800, fontSize: 20,
              }}
              className="flex items-center justify-center"
            >
              {initials(u.firstName, u.lastName)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{u.firstName}</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>{ROLE_LABELS[u.role] ?? u.role}</div>
            {!u.pinSet && (
              <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.warning }}>PIN à créer</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
