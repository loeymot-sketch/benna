import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { COLORS } from '../lib/tokens';
import { Logo, Avatar } from './Atoms';
import { useAuth } from '../store/auth';
import { api } from '../lib/api';
import { ROLE_LABELS, POST_TYPE_META, fullName } from '../lib/tokens';
import { getSocket } from '../lib/socket';
import { PinPad } from './PinPad';

const NAV = [
  { id: 'dashboard', to: '/', label: 'Tableau de bord', icon: 'home' },
  { id: 'kanban',    to: '/kanban', label: 'Kanban', icon: 'kanban' },
  { id: 'orders',    to: '/orders', label: 'Commandes', icon: 'list' },
  { id: 'scan',      to: '/scan', label: 'Scanner pochette', icon: 'scan', highlight: true },
  { id: 'customers', to: '/customers', label: 'Clients', icon: 'users' },
  { id: 'carnet',    to: '/carnet', label: 'Le Carnet', icon: 'book' },
  { id: 'cash',      to: '/cash', label: 'Caisse & CA', icon: 'cash', adminOnly: true, lock: true },
  { id: 'team',      to: '/team', label: 'Équipe', icon: 'team', adminOnly: true },
];

const ICONS: Record<string, JSX.Element> = {
  home:   <path d="M3 10.5L12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>,
  kanban: <><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/></>,
  list:   <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
  users:  <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14a5 5 0 0 1 5.5 5"/></>,
  cash:   <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></>,
  scan:   <><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M3 12h18"/></>,
  book:   <><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z"/><path d="M4 16a4 4 0 0 1 4-4h12"/></>,
  team:   <><circle cx="12" cy="7" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
  bell:   <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  plus:   <path d="M12 5v14M5 12h14"/>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>,
};

export function Icon({ name, size = 18, color = 'currentColor', stroke = 1.75 }: { name: string; size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const clear = useAuth((s) => s.clear);
  const navigate = useNavigate();
  const [inboxCount, setInboxCount] = useState(0);
  const [openOrdersCount, setOpenOrdersCount] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();
  const [toast, setToast] = useState<{ text: string; to: string } | null>(null);
  const [pinLater, setPinLater] = useState(false);
  const refreshRef = useRef<() => void>(() => {});

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const [inb, dash] = await Promise.all([
          api.get('/me/inbox-count'),
          api.get('/dashboard'),
        ]);
        if (!active) return;
        setInboxCount(inb.data.count);
        setOpenOrdersCount(dash.data.counters.openCount);
      } catch {}
    };
    refresh();
    refreshRef.current = refresh;
    const t = setInterval(refresh, 15000);
    return () => { active = false; clearInterval(t); };
  }, [loc.pathname]);

  // Temps réel : une passation / un message pour moi apparaît tout de suite (badge + bandeau).
  useEffect(() => {
    if (!user) return;
    const sock = getSocket();
    let hide: ReturnType<typeof setTimeout>;
    const show = (text: string, to: string) => {
      setToast({ text, to }); clearTimeout(hide); hide = setTimeout(() => setToast(null), 7000);
    };
    const mine = (e: any) =>
      e.authorId !== user.id && (
        e.recipientUserId === user.id ||
        (e.scope === 'ROLE' && e.recipientRole === user.role) ||
        (e.scope === 'SHOP' && e.recipientShopId && e.recipientShopId === user.shopId) ||
        e.scope === 'ALL'
      );
    const onPost = (e: any) => {
      refreshRef.current();
      if (!mine(e)) return;
      const urgent = e.urgency === 'HIGH' || e.urgency === 'CRITICAL';
      show(`${urgent ? '🔴 ' : ''}${e.authorName} → ${e.title || POST_TYPE_META[e.type]?.label || 'Message'}`, `/carnet/post/${e.id}`);
    };
    const onReply = (e: any) => {
      refreshRef.current();
      if (e.authorId === user.id) return;
      if (e.parentAuthorId === user.id || e.recipientUserId === user.id) show(`${e.authorName} a répondu`, `/carnet/post/${e.id}`);
    };
    const onChange = () => refreshRef.current();
    sock.on('post.created', onPost);
    sock.on('post.replied', onReply);
    sock.on('post.resolved', onChange);
    sock.on('order.created', onChange);
    sock.on('order.status_changed', onChange);
    return () => {
      clearTimeout(hide);
      sock.off('post.created', onPost);
      sock.off('post.replied', onReply);
      sock.off('post.resolved', onChange);
      sock.off('order.created', onChange);
      sock.off('order.status_changed', onChange);
    };
  }, [user?.id]);

  // Mobile responsive: collapse sidebar under 900px
  useEffect(() => {
    const onResize = () => setCollapsed(window.innerWidth < 900);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onLogout = () => {
    clear();
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex h-full" style={{ background: COLORS.bg }}>
      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? 64 : 240, background: COLORS.panel,
          borderRight: `1px solid ${COLORS.border}`,
          flex: `0 0 ${collapsed ? 64 : 240}px`,
          transition: 'width 200ms ease',
        }}
        className="flex flex-col"
      >
        <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${COLORS.border}` }}>
          {collapsed ? <Logo size={28} withText={false} /> : <Logo />}
        </div>
        <nav className="flex-1 p-2.5 flex flex-col gap-0.5">
          {NAV.filter((it) => !it.adminOnly || isAdmin).map((it) => (
            <NavLink
              key={it.id} to={it.to} end={it.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg cursor-pointer transition-colors`
              }
              style={({ isActive }) => ({
                padding: collapsed ? '10px' : '9px 10px',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? COLORS.primary : it.highlight ? COLORS.accent : COLORS.text,
                background: isActive ? COLORS.primary + '14' : 'transparent',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
            >
              <Icon name={it.icon} size={17} />
              {!collapsed && <span style={{ flex: 1 }}>{it.label}</span>}
              {!collapsed && it.id === 'orders' && openOrdersCount != null && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: COLORS.border, color: COLORS.muted }}>
                  {openOrdersCount}
                </span>
              )}
              {!collapsed && it.id === 'carnet' && inboxCount > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: COLORS.accent, color: '#fff' }}>
                  {inboxCount}
                </span>
              )}
              {!collapsed && (it as any).lock && <span title="Protégé par ton code" style={{ fontSize: 11 }}>🔒</span>}
              {!collapsed && it.highlight && (
                <span style={{ width: 6, height: 6, borderRadius: 999, background: COLORS.accent }} />
              )}
            </NavLink>
          ))}
          <div className="flex-1" />
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 rounded-lg cursor-pointer transition-colors"
            style={{
              padding: collapsed ? '10px' : '9px 10px',
              fontSize: 13, color: COLORS.muted,
              background: 'transparent', border: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <Icon name="logout" size={17} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </nav>
        <Link
          to="/profile"
          className="flex items-center gap-2.5 hover:bg-bg cursor-pointer"
          style={{ padding: 12, borderTop: `1px solid ${COLORS.border}`, justifyContent: collapsed ? 'center' : 'flex-start', textDecoration: 'none', color: 'inherit' }}
        >
          <Avatar firstName={user.firstName} lastName={user.lastName} size={collapsed ? 30 : 34} />
          {!collapsed && (
            <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                {fullName(user)} · {ROLE_LABELS[user.role] ?? user.role}
              </div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>
                {isAdmin ? 'Accès total' : 'Mon profil'}
              </div>
            </div>
          )}
          {!collapsed && <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.success }} title="Connecté" />}
        </Link>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {user.mustChangePin && !pinLater && <FirstPinModal onLater={() => setPinLater(true)} />}
        {user.mustChangePin && pinLater && (
          <div className="flex items-center justify-between gap-3 flex-wrap" style={{ background: COLORS.warning + '22', borderBottom: `1px solid ${COLORS.warning}`, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>
            <span>⚠️ Ton code est encore le code par défaut (0000) — n'importe qui peut ouvrir ton profil.</span>
            <button onClick={() => setPinLater(false)} style={{ background: COLORS.text, color: '#fff', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              Choisir mon code
            </button>
          </div>
        )}
        {toast && (
          <Link
            to={toast.to} onClick={() => setToast(null)}
            style={{
              position: 'fixed', top: 76, right: 16, zIndex: 60, maxWidth: 320, textDecoration: 'none',
              background: COLORS.text, color: '#fff', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              boxShadow: '0 8px 24px rgba(15,23,42,.25)',
            }}
          >
            🔔 {toast.text}
            <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.7, marginTop: 2 }}>Toucher pour ouvrir</div>
          </Link>
        )}
        <TopBar inboxCount={inboxCount} />
        <div className="flex-1 overflow-auto" style={{ background: COLORS.bg }}>
          {children}
        </div>
      </main>
    </div>
  );
}

// Première connexion avec un code temporaire remis par un admin : on impose un code personnel.
function FirstPinModal({ onLater }: { onLater: () => void }) {
  const user = useAuth((s) => s.user)!;
  const patchUser = useAuth((s) => s.patchUser);
  const len = user.role === 'ADMIN' ? 6 : 4;
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = async (pin: string) => {
    setError(null);
    if (!first) return setFirst(pin);
    if (pin !== first) { setFirst(null); return setError('Les deux codes ne correspondent pas — recommence.'); }
    setBusy(true);
    try {
      await api.post('/me/set-initial-pin', { newPin: pin });
      patchUser({ mustChangePin: false });
    } catch (e: any) {
      setFirst(null);
      setError(e.response?.data?.error === 'same_pin' ? 'Choisis un code différent du code temporaire.' : 'Erreur — réessaie.');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: COLORS.panel, borderRadius: 16, padding: 28, width: '100%', maxWidth: 360 }}>
        <div style={{ fontSize: 20, fontWeight: 800, textAlign: 'center' }}>Bienvenue {fullName(user)} 👋</div>
        <div style={{ fontSize: 13, color: COLORS.muted, textAlign: 'center', margin: '6px 0 18px' }}>
          {first ? 'Saisis-le encore une fois pour confirmer.' : `Tu peux choisir ton code personnel (${len} chiffres) — il remplace le code par défaut 0000.`}
        </div>
        <PinPad key={first ? 'confirm' : 'choose'} length={len} onComplete={onComplete} disabled={busy} error={error} />
        <button onClick={onLater} style={{ display: 'block', margin: '14px auto 0', background: 'transparent', border: 'none', color: COLORS.muted, fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline' }}>
          Plus tard (garder 0000)
        </button>
      </div>
    </div>
  );
}

function TopBar({ inboxCount }: { inboxCount: number }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const titles: Record<string, { title: string; subtitle?: string }> = {
    '/': { title: 'Tableau de bord', subtitle: 'Vue temps réel · activité du jour' },
    '/kanban': { title: 'Flux de production', subtitle: 'Drag & drop pour avancer les commandes' },
    '/orders': { title: 'Commandes', subtitle: 'Toutes les commandes' },
    '/scan': { title: 'Scanner pochette', subtitle: 'Extraction IA des pochettes papier' },
    '/customers': { title: 'Clients', subtitle: 'Annuaire et historique' },
    '/carnet': { title: 'Le Carnet', subtitle: 'Communication interne · passations · alertes' },
    '/carnet/inbox': { title: 'Pour Moi', subtitle: 'Items à traiter' },
    '/cash': { title: 'Caisse & chiffre d\'affaires', subtitle: 'Réservé aux admins · protégé par ton code' },
    '/team': { title: 'Équipe', subtitle: 'Gestion des membres et permissions' },
    '/profile': { title: 'Mon profil', subtitle: 'Changer mon PIN, voir ma session' },
  };
  // Match dynamic routes for nicer titles
  let meta = titles[loc.pathname];
  if (!meta) {
    if (loc.pathname.startsWith('/orders/new')) meta = { title: 'Nouvelle commande', subtitle: 'Saisir une commande' };
    else if (loc.pathname.startsWith('/orders/')) meta = { title: 'Détail commande', subtitle: 'Suivi, paiements, carnet' };
    else if (loc.pathname.startsWith('/customers/')) meta = { title: 'Fiche client', subtitle: 'Historique des commandes' };
    else if (loc.pathname.startsWith('/carnet/post/')) meta = { title: 'Détail post', subtitle: 'Thread + accusés de lecture' };
    else if (loc.pathname.startsWith('/carnet/new')) meta = { title: 'Nouveau post', subtitle: 'Choisir un type → composer' };
    else meta = { title: 'EL BENNA LAB OS' };
  }

  return (
    <div
      className="flex items-center gap-3 flex-shrink-0"
      style={{ height: 64, padding: isNarrow ? '0 14px' : '0 24px', borderBottom: `1px solid ${COLORS.border}`, background: COLORS.panel }}
    >
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: isNarrow ? 16 : 18, fontWeight: 700, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta.title}</div>
        {meta.subtitle && !isNarrow && <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta.subtitle}</div>}
      </div>
      <button
        onClick={() => navigate('/orders/new')}
        className="rounded-lg cursor-pointer flex items-center gap-1.5 flex-shrink-0"
        style={{ height: 38, padding: isNarrow ? '0 12px' : '0 14px', background: COLORS.primary, color: '#fff', fontWeight: 600, fontSize: 13, border: 'none' }}
        aria-label="Nouvelle commande"
      >
        <Icon name="plus" size={15} />
        {!isNarrow && 'Nouvelle commande'}
      </button>
      <Link to="/carnet/inbox" className="relative flex-shrink-0">
        <Icon name="bell" size={20} color={COLORS.muted} />
        {inboxCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -8,
            minWidth: 16, height: 16, padding: '0 4px',
            background: COLORS.accent, color: '#fff', fontSize: 10, fontWeight: 700,
            borderRadius: 999, border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {inboxCount}
          </span>
        )}
      </Link>
    </div>
  );
}
