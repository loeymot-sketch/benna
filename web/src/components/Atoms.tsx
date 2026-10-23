import { COLORS, STATUS_LABELS, URGENCY_COLORS, POST_TYPE_META, initials } from '../lib/tokens';

export function Logo({ size = 28, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{
          width: size, height: size, borderRadius: 8,
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
          color: '#fff', fontWeight: 800, fontSize: size * 0.5,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          position: 'relative',
        }}
        className="flex items-center justify-center"
      >
        <span style={{ letterSpacing: -0.5 }}>EB</span>
        <span
          style={{
            position: 'absolute', right: -2, bottom: -2, width: 8, height: 8,
            borderRadius: 2, background: COLORS.accent, border: '1.5px solid #fff',
          }}
        />
      </div>
      {withText && (
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.primary, letterSpacing: 0.4 }}>
            LABO PHOTO NUMÉRIQUE
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.accent, letterSpacing: 0.5 }}>
            EL BENNA <span style={{ color: COLORS.muted, fontWeight: 500, fontSize: 11, letterSpacing: 1.5 }}>· LAB OS</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const m = STATUS_LABELS[status] ?? STATUS_LABELS.RECUE;
  return (
    <span
      className="pill"
      style={{
        background: m.color + '1a', color: m.color,
        border: `1px solid ${m.color}33`, whiteSpace: 'nowrap',
      }}
    >
      {m.label}
    </span>
  );
}

export function UrgencyDot({ level }: { level: string }) {
  const c = URGENCY_COLORS[level] ?? COLORS.urgNormal;
  return (
    <span
      style={{
        width: 8, height: 8, borderRadius: 999, background: c,
        boxShadow: level === 'URGENT' || level === 'EXPRESS' ? `0 0 0 3px ${c}26` : 'none',
        display: 'inline-block', flex: '0 0 auto',
      }}
    />
  );
}

export function Badge({ children, color = COLORS.muted, soft = false }: { children: React.ReactNode; color?: string; soft?: boolean }) {
  return (
    <span
      className="pill"
      style={{
        background: soft ? color + '1a' : color,
        color: soft ? color : '#fff',
        border: soft ? `1px solid ${color}33` : 'none',
      }}
    >
      {children}
    </span>
  );
}

export function Avatar({ firstName, lastName, size = 32 }: { firstName: string; lastName: string; size?: number }) {
  const ini = initials(firstName, lastName);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 999,
        background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
        color: '#fff', fontWeight: 700, fontSize: size * 0.4,
      }}
      className="flex items-center justify-center flex-shrink-0"
    >
      {ini}
    </div>
  );
}

export function PostTypeChip({ type }: { type: string }) {
  const m = POST_TYPE_META[type] ?? POST_TYPE_META.NOTE;
  return (
    <span
      className="pill"
      style={{ background: m.color + '15', color: m.color, border: `1px solid ${m.color}33` }}
    >
      <span>{m.icon}</span>
      <span>{m.label}</span>
    </span>
  );
}

export function Card({
  children, className = '', style, onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-panel border border-border rounded-lg ${className}`}
      style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 10, ...style }}
    >
      {children}
    </div>
  );
}

export function Button({
  children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, className = '', style,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: COLORS.primary, color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: COLORS.text, border: `1px solid ${COLORS.border}` },
    ghost:     { background: 'transparent', color: COLORS.text, border: 'none' },
    danger:    { background: COLORS.danger, color: '#fff', border: 'none' },
    accent:    { background: COLORS.accent, color: '#fff', border: 'none' },
  };
  const sizes: Record<string, React.CSSProperties> = {
    sm: { height: 30, padding: '0 10px', fontSize: 12 },
    md: { height: 36, padding: '0 14px', fontSize: 13 },
    lg: { height: 44, padding: '0 18px', fontSize: 14 },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity ${className}`}
      style={{ ...styles[variant], ...sizes[size], ...style }}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ padding: '48px 24px', color: COLORS.muted }}>
      {icon && <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>}
      <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{title}</div>
      {hint && <div style={{ fontSize: 13, marginTop: 6, color: COLORS.muted }}>{hint}</div>}
    </div>
  );
}
