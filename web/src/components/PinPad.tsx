import { useEffect, useRef, useState } from 'react';
import { COLORS } from '../lib/tokens';

// Clavier de code à chiffres : clic/tap OU clavier physique. Appelle onComplete(pin)
// dès que `length` chiffres sont saisis, puis se vide (le parent affiche l'erreur éventuelle).
export function PinPad({
  length, onComplete, disabled = false, error,
}: { length: number; onComplete: (pin: string) => void; disabled?: boolean; error?: string | null }) {
  const [pin, setPin] = useState('');
  const pinRef = useRef('');
  pinRef.current = pin;
  // Ignore les touches des 400 premières ms : une saisie rapide commencée sur l'écran précédent
  // (ex. code de connexion tapé au clavier) ne doit pas déborder dans ce clavier.
  const mountedAt = useRef(Date.now());

  const press = (key: string) => {
    if (disabled || Date.now() - mountedAt.current < 400) return;
    if (key === 'back') return setPin((p) => p.slice(0, -1));
    if (key === 'C') return setPin('');
    if (pinRef.current.length >= length) return;
    const next = pinRef.current + key;
    setPin(next);
    if (next.length === length) setTimeout(() => { onComplete(next); setPin(''); }, 150);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('back');
      else if (e.key === 'Escape') press('C');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div style={{ width: '100%', maxWidth: 280, margin: '0 auto' }}>
      <div className="flex justify-center gap-3" style={{ marginBottom: 12 }} aria-label={`Code à ${length} chiffres`}>
        {Array.from({ length }, (_, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 999,
            background: i < pin.length ? COLORS.primary : 'transparent',
            border: `2px solid ${error ? COLORS.danger : i < pin.length ? COLORS.primary : COLORS.borderStrong}`,
            transition: 'background 120ms',
          }} />
        ))}
      </div>
      <div style={{ minHeight: 20, textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: COLORS.danger, marginBottom: 8 }} role="alert">
        {error ?? ''}
      </div>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'back'].map((k) => (
          <button
            key={k} type="button" disabled={disabled} onClick={() => press(k)}
            aria-label={k === 'back' ? 'Effacer' : k === 'C' ? 'Tout effacer' : k}
            style={{
              height: 54, borderRadius: 12, fontSize: k.length > 1 || k === 'C' ? 15 : 22, fontWeight: 600,
              background: COLORS.panel, border: `1px solid ${COLORS.border}`, color: COLORS.text,
              cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
            }}
          >
            {k === 'back' ? '⌫' : k}
          </button>
        ))}
      </div>
    </div>
  );
}
