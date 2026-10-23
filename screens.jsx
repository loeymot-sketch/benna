// EL BENNA LAB OS — Screens
// Multiple screens shown side-by-side in DesignCanvas

const COLORS = {
  primary: '#1e3a8a',
  primaryDark: '#172554',
  accent: '#dc2626',
  accentSoft: '#fee2e2',
  bg: '#f7f7f5',
  panel: '#ffffff',
  border: '#e6e4df',
  borderStrong: '#d6d3cc',
  text: '#0f172a',
  muted: '#64748b',
  mutedSoft: '#94a3b8',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  // urgency
  urgNormal: '#16a34a',
  urgPriority: '#f59e0b',
  urgUrgent: '#dc2626',
  urgExpress: '#0f172a',
  // status
  stRecue: '#94a3b8',
  stEnCours: '#3b82f6',
  stValidation: '#a855f7',
  stProduction: '#f97316',
  stPrete: '#16a34a',
  stLivree: '#64748b',
};

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

// ───────────────────────── Shared atoms ─────────────────────────
const Logo = ({ size = 28, withText = true, dark = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.5,
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      position: 'relative',
    }}>
      <span style={{ letterSpacing: -0.5 }}>EB</span>
      <span style={{
        position: 'absolute', right: -2, bottom: -2, width: 8, height: 8,
        borderRadius: 2, background: COLORS.accent, border: '1.5px solid #fff'
      }} />
    </div>
    {withText && (
      <div style={{ lineHeight: 1.05 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: dark ? '#cbd5e1' : COLORS.primary, letterSpacing: 0.4 }}>
          LABO PHOTO NUMÉRIQUE
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.accent, letterSpacing: 0.5 }}>
          EL BENNA <span style={{ color: dark ? '#94a3b8' : COLORS.muted, fontWeight: 500, fontSize: 11, letterSpacing: 1.5 }}>· LAB OS</span>
        </div>
      </div>
    )}
  </div>
);

const Badge = ({ children, color = COLORS.muted, soft = false, style }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 999,
    fontSize: 11, fontWeight: 600,
    background: soft ? color + '1a' : color,
    color: soft ? color : '#fff',
    border: soft ? `1px solid ${color}33` : 'none',
    whiteSpace: 'nowrap',
    ...style,
  }}>{children}</span>
);

const UrgencyDot = ({ level }) => {
  const map = {
    NORMAL: COLORS.urgNormal,
    PRIORITAIRE: COLORS.urgPriority,
    URGENT: COLORS.urgUrgent,
    EXPRESS: COLORS.urgExpress,
  };
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 999, background: map[level],
      display: 'inline-block', flex: '0 0 auto',
      boxShadow: level === 'URGENT' || level === 'EXPRESS' ? `0 0 0 3px ${map[level]}26` : 'none',
    }} />
  );
};

const StatusPill = ({ status }) => {
  const map = {
    RECUE: { bg: COLORS.stRecue, label: 'Reçue' },
    EN_ATTENTE: { bg: COLORS.stRecue, label: 'En attente' },
    EN_COURS_DESIGN: { bg: COLORS.stEnCours, label: 'Design' },
    VALIDATION_CLIENT: { bg: COLORS.stValidation, label: 'Validation client' },
    EN_PRODUCTION: { bg: COLORS.stProduction, label: 'Production' },
    EN_FINITION: { bg: COLORS.stProduction, label: 'Finition' },
    PRETE: { bg: COLORS.stPrete, label: 'Prête' },
    LIVREE: { bg: COLORS.stLivree, label: 'Livrée' },
    ANNULEE: { bg: COLORS.danger, label: 'Annulée' },
  };
  const m = map[status] || map.RECUE;
  return <Badge color={m.bg} soft>{m.label}</Badge>;
};

const Icon = ({ name, size = 16, color = 'currentColor', stroke = 1.75 }) => {
  const paths = {
    home: <><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></>,
    kanban: <><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    users: <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 5.5 5"/></>,
    cam: <><path d="M3 7h3l2-2h8l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></>,
    bag: <><path d="M5 7h14l-1 13H6L5 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></>,
    cash: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v.01M18 15v.01"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    scan: <><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M3 12h18"/></>,
    qr: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h.01M17 17v4M21 17v4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    fire: <><path d="M12 2s4 4 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 0 0 12 0c0-7-6-12-6-12z"/></>,
    check: <><path d="M5 12l5 5L20 7"/></>,
    x: <><path d="M6 6l12 12M18 6L6 18"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    print: <><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></>,
    msg: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m21 15-5-5-9 9"/></>,
    sparkle: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></>,
    backspace: <><path d="M21 5H8l-6 7 6 7h13a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="M18 9l-6 6M12 9l6 6"/></>,
    grip: <><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ───────────────────────── App shell ─────────────────────────
const Sidebar = ({ active = 'dashboard', user }) => {
  const items = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'home' },
    { id: 'kanban', label: 'Kanban', icon: 'kanban' },
    { id: 'orders', label: 'Commandes', icon: 'list', count: 47 },
    { id: 'scan', label: 'Scanner pochette', icon: 'scan', highlight: true },
    { id: 'customers', label: 'Clients', icon: 'users' },
    { id: 'studio', label: 'Studio', icon: 'cam' },
    { id: 'catalog', label: 'Catalogue', icon: 'bag' },
    { id: 'cash', label: 'Caisse', icon: 'cash' },
    { id: 'stats', label: 'Statistiques', icon: 'chart' },
  ];
  return (
    <aside style={{
      width: 240, background: COLORS.panel, borderRight: `1px solid ${COLORS.border}`,
      display: 'flex', flexDirection: 'column', flex: '0 0 240px',
    }}>
      <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
        <Logo />
      </div>
      <nav style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {items.map(it => {
          const isActive = it.id === active;
          return (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8,
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              color: isActive ? COLORS.primary : (it.highlight ? COLORS.accent : COLORS.text),
              background: isActive ? COLORS.primary + '14' : 'transparent',
              cursor: 'pointer',
              position: 'relative',
            }}>
              <Icon name={it.icon} size={17} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.count != null && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px',
                  borderRadius: 999, background: isActive ? COLORS.primary : COLORS.border,
                  color: isActive ? '#fff' : COLORS.muted,
                }}>{it.count}</span>
              )}
              {it.highlight && !isActive && (
                <span style={{ width: 6, height: 6, borderRadius: 999, background: COLORS.accent }} />
              )}
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{
          margin: '8px 6px', padding: '9px 10px', borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, color: COLORS.muted, cursor: 'pointer',
        }}>
          <Icon name="settings" size={17} />
          <span>Paramètres</span>
        </div>
      </nav>
      <div style={{
        padding: 12, borderTop: `1px solid ${COLORS.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 999,
          background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
          color: '#fff', fontWeight: 700, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{user?.initials || 'AD'}</div>
        <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.text }}>{user?.name || 'Adel · Admin'}</div>
          <div style={{ fontSize: 11, color: COLORS.muted }}>Boutique 1 · Bourguiba</div>
        </div>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.success }} />
      </div>
    </aside>
  );
};

const TopBar = ({ title, subtitle, right }) => (
  <div style={{
    height: 64, padding: '0 24px',
    borderBottom: `1px solid ${COLORS.border}`,
    background: COLORS.panel,
    display: 'flex', alignItems: 'center', gap: 16, flex: '0 0 64px',
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, letterSpacing: -0.2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 1 }}>{subtitle}</div>}
    </div>
    <div style={{
      flex: '0 0 320px', height: 38, borderRadius: 8,
      background: COLORS.bg, border: `1px solid ${COLORS.border}`,
      display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
      color: COLORS.muted, fontSize: 13,
    }}>
      <Icon name="search" size={15} />
      <span style={{ flex: 1 }}>Rechercher commande, client, GSM…</span>
      <kbd style={{
        fontSize: 10, padding: '1px 5px', borderRadius: 4,
        border: `1px solid ${COLORS.border}`, background: '#fff', color: COLORS.muted,
        fontFamily: FONT,
      }}>⌘K</kbd>
    </div>
    {right}
    <button style={{
      height: 38, padding: '0 14px', borderRadius: 8, border: 'none',
      background: COLORS.primary, color: '#fff', fontWeight: 600, fontSize: 13,
      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: FONT,
    }}>
      <Icon name="plus" size={15} />
      Nouvelle commande
    </button>
    <div style={{ position: 'relative' }}>
      <Icon name="bell" size={20} color={COLORS.muted} />
      <span style={{
        position: 'absolute', top: -2, right: -2, width: 8, height: 8,
        background: COLORS.accent, borderRadius: 999, border: '2px solid #fff'
      }} />
    </div>
  </div>
);

Object.assign(window, { COLORS, FONT, Logo, Badge, UrgencyDot, StatusPill, Icon, Sidebar, TopBar });
