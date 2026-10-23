// EL BENNA LAB OS — Mobile (PWA) + Tablet
// Two roles: ÉQUIPE (no money, no admin stats) — ADMIN (full overview)
// Hero: floating SCAN POCHETTE button always at bottom

const M = {
  bg: '#f5f5f7',
  panel: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  mutedSoft: '#94a3b8',
  border: '#e5e7eb',
  primary: '#1e3a8a',
  primaryDark: '#0a1f4d',
  accent: '#dc2626',
  accentSoft: '#fef2f2',
  success: '#16a34a',
  warning: '#f59e0b',
  bgDark: '#0a1f4d',
};

// ───────── Bottom tab bar (with center scan FAB) ─────────
const MobileTabBar = ({ active = 'home', role = 'team' }) => {
  const tabs = role === 'admin'
    ? [
        { id: 'home', icon: 'home', label: 'Accueil' },
        { id: 'orders', icon: 'list', label: 'Commandes' },
        { id: 'scan', icon: 'scan', label: 'Scan', center: true },
        { id: 'carnet', icon: 'file', label: 'Carnet' },
        { id: 'stats', icon: 'chart', label: 'Stats' },
      ]
    : [
        { id: 'home', icon: 'home', label: 'Accueil' },
        { id: 'orders', icon: 'list', label: 'Commandes' },
        { id: 'scan', icon: 'scan', label: 'Scan', center: true },
        { id: 'carnet', icon: 'file', label: 'Carnet' },
        { id: 'me', icon: 'user', label: 'Moi' },
      ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 6,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${M.border}`,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around',
      zIndex: 20, fontFamily: FONT,
    }}>
      {tabs.map(t => {
        if (t.center) {
          return (
            <div key={t.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                position: 'absolute', bottom: 0, width: 64, height: 64, borderRadius: 999,
                background: `linear-gradient(135deg, ${M.accent}, #b91c1c)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 22px ${M.accent}66, 0 0 0 5px #fff`,
                color: '#fff',
              }}>
                <Icon name="scan" size={32} stroke={2.4} color="#fff" />
              </div>
              <div style={{ height: 60 }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: M.accent, marginTop: 2 }}>SCAN</div>
            </div>
          );
        }
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, paddingTop: 6,
          }}>
            <Icon name={t.icon} size={22} color={isActive ? M.primary : M.mutedSoft} stroke={isActive ? 2.4 : 1.8} />
            <div style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? M.primary : M.mutedSoft }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ───────── Mobile login (PIN) ─────────
const MobileLogin = () => {
  const users = [
    { i: 'AD', n: 'Adel', r: 'Admin', c: 'linear-gradient(135deg,#f59e0b,#dc2626)', admin: true },
    { i: 'KA', n: 'Karim', r: 'Designer', c: '#a855f7' },
    { i: 'SO', n: 'Sonia', r: 'Réception', c: '#3b82f6' },
    { i: 'ME', n: 'Mehdi', r: 'Imprimeur', c: '#f97316' },
    { i: 'YO', n: 'Yosra', r: 'Réception B2', c: '#14b8a6' },
    { i: '+', n: 'Autre', r: '', c: '#cbd5e1' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(180deg, ${M.bgDark} 0%, ${M.primary} 60%, ${M.primaryDark} 100%)`,
      color: '#fff', fontFamily: FONT, padding: '70px 24px 0', position: 'relative', overflow: 'hidden',
    }}>
      {/* deco */}
      <div style={{ position: 'absolute', top: -100, right: -60, width: 280, height: 280, borderRadius: 999, background: 'radial-gradient(circle, #dc262644, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: 100, left: -80, width: 240, height: 240, borderRadius: 999, background: 'radial-gradient(circle, #3b82f644, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 28 }}>
        <Logo size={38} stacked invert />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 18, fontWeight: 600, letterSpacing: 0.5 }}>BIENVENUE</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>Qui es-tu ?</div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
        position: 'relative', zIndex: 2,
      }}>
        {users.map(u => (
          <div key={u.n} style={{
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
            border: `1px solid rgba(255,255,255,${u.admin ? 0.4 : 0.18})`,
            borderRadius: 16, padding: '14px 8px', textAlign: 'center',
            boxShadow: u.admin ? `0 0 0 2px ${M.accent}55, 0 8px 24px ${M.accent}33` : 'none',
          }}>
            {u.i === '+' ? (
              <div style={{ width: 52, height: 52, borderRadius: 999, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 26, fontWeight: 300 }}>+</div>
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 999, background: u.c, color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: u.admin ? '2px solid #fde68a' : 'none' }}>{u.i}</div>
            )}
            <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 8 }}>{u.n}</div>
            <div style={{ fontSize: 9.5, opacity: 0.7, marginTop: 1 }}>{u.r}</div>
            {u.admin && (
              <div style={{ fontSize: 8.5, fontWeight: 800, color: '#fde68a', marginTop: 4, letterSpacing: 0.5 }}>★ ADMIN</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 50, left: 24, right: 24, zIndex: 2, textAlign: 'center' }}>
        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          Application web · Ajoute à l'écran d'accueil pour un accès rapide<br/>
          <span style={{ fontSize: 9.5, opacity: 0.7 }}>Chacun a son code PIN à 6 chiffres</span>
        </div>
      </div>
    </div>
  );
};

// ───────── Mobile PIN entry ─────────
const MobilePIN = () => {
  const filled = 4;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(180deg, ${M.bgDark} 0%, ${M.primary} 100%)`,
      color: '#fff', fontFamily: FONT, padding: '70px 32px 0',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{ width: 80, height: 80, borderRadius: 999, background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, boxShadow: '0 8px 30px rgba(168,85,247,0.5)' }}>KA</div>
      <div style={{ fontSize: 19, fontWeight: 700, marginTop: 14 }}>Karim</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Designer · Boutique 1</div>

      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 32, marginBottom: 14, opacity: 0.85 }}>Saisis ton code à 6 chiffres</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 999,
            background: i < filled ? '#fff' : 'transparent',
            border: '2px solid rgba(255,255,255,0.35)',
            boxShadow: i < filled ? '0 0 12px rgba(255,255,255,0.5)' : 'none',
          }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, width: 260 }}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
          <div key={i} style={{
            height: 64, borderRadius: 999,
            background: k ? 'rgba(255,255,255,0.12)' : 'transparent',
            backdropFilter: k ? 'blur(20px)' : 'none',
            border: k ? '1px solid rgba(255,255,255,0.15)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 400, color: '#fff',
          }}>{k}</div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 50, fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
        Mot de passe oublié ? Demande à Adel
      </div>
    </div>
  );
};

// ───────── Mobile Home — TEAM (équipe) ─────────
const MobileHomeTeam = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: M.bg, fontFamily: FONT, color: M.text, paddingTop: 54, paddingBottom: 130, overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 18px', background: '#fff', borderBottom: `1px solid ${M.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: '#a855f7', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>KA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: M.muted }}>Bonjour 👋</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Karim · Designer</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: M.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Icon name="bell" size={20} color={M.muted} />
          </div>
        </div>
      </div>

      {/* Critical banner */}
      <div style={{ margin: '14px 16px 0', padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #fef2f2, #fff)', border: `1px solid #fecaca`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: M.accent + '14', color: M.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <Icon name="fire" size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: M.accent, letterSpacing: 0.4 }}>CRITIQUE · DANS 2H</div>
          <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>Maquette faire-part Studio Maya à finaliser</div>
        </div>
        <Icon name="arrow" size={16} color={M.accent} />
      </div>

      {/* My tasks */}
      <div style={{ margin: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>Mes commandes en cours</div>
          <div style={{ fontSize: 11.5, color: M.primary, fontWeight: 600 }}>Voir tout →</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { code: 'LB-…0042', t: 'Cartes visite carton — 50 ex', client: 'A. Khelifi', tag: 'EN PRODUCTION', col: '#06b6d4', urg: true },
            { code: 'LB-…0037', t: 'Logo Resto Dar Yassmine V3', client: 'O. Mejri', tag: 'À FAIRE', col: '#f59e0b' },
            { code: 'LB-…0033', t: 'Affiches A2 — 12 ex', client: 'Studio Maya', tag: 'MAQUETTE', col: '#8b5cf6' },
          ].map(o => (
            <div key={o.code} style={{ background: '#fff', borderRadius: 12, padding: 12, border: `1px solid ${M.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 36, borderRadius: 999, background: o.col }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10.5, fontWeight: 700, color: M.primary }}>{o.code}</span>
                  {o.urg && <span style={{ fontSize: 9, fontWeight: 800, color: M.accent, background: M.accentSoft, padding: '1px 5px', borderRadius: 4 }}>● URGENT</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>{o.t}</div>
                <div style={{ fontSize: 10.5, color: M.muted, marginTop: 1 }}>{o.client}</div>
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: o.col, padding: '3px 7px', background: o.col + '14', borderRadius: 4, whiteSpace: 'nowrap' }}>{o.tag}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Carnet preview */}
      <div style={{ margin: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>📓 Carnet — Pour moi</div>
          <span style={{ fontSize: 10, fontWeight: 800, background: M.accent, color: '#fff', padding: '2px 7px', borderRadius: 999 }}>3</span>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${M.border}`, overflow: 'hidden' }}>
          {[
            { c: '#3b82f6', l: 'PASSATION', t: 'Maquette validée — à imprimer', w: 'Sonia · 14:25', new: true },
            { c: '#f59e0b', l: 'TÂCHE', t: 'Refaire logo Resto Dar Yassmine V3', w: 'Adel · il y a 1h', new: true },
            { c: '#8b5cf6', l: 'QUESTION', t: '@Karim fond transparent ?', w: 'Yosra · il y a 4h', new: true },
          ].map((p, i) => (
            <div key={i} style={{ padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10, borderTop: i ? `1px solid ${M.border}` : 'none' }}>
              <div style={{ width: 3, height: 32, background: p.c, borderRadius: 999 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: p.c, letterSpacing: 0.4 }}>{p.l}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, marginTop: 1 }}>{p.t}</div>
                <div style={{ fontSize: 10, color: M.muted, marginTop: 1 }}>{p.w}</div>
              </div>
              {p.new && <span style={{ width: 7, height: 7, borderRadius: 999, background: M.primary }} />}
            </div>
          ))}
        </div>
      </div>

      <MobileTabBar active="home" role="team" />
    </div>
  );
};

// ───────── Mobile Home — ADMIN ─────────
const MobileHomeAdmin = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: M.bg, fontFamily: FONT, color: M.text, paddingTop: 54, paddingBottom: 130, overflow: 'hidden', position: 'relative' }}>
      {/* Dark hero header */}
      <div style={{ padding: '14px 18px 24px', background: `linear-gradient(160deg, ${M.bgDark}, ${M.primary})`, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: 'linear-gradient(135deg,#f59e0b,#dc2626)', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px rgba(255,255,255,0.2)' }}>AD</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Mode Admin · 9 mai · 14:38</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Adel <span style={{ fontSize: 10, fontWeight: 800, background: '#fde68a', color: '#854d0e', padding: '2px 6px', borderRadius: 4, marginLeft: 4, letterSpacing: 0.5, verticalAlign: 'middle' }}>★ ADMIN</span></div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backdropFilter: 'blur(20px)' }}>
            <Icon name="bell" size={20} color="#fff" />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 999, background: M.accent, border: '2px solid #1e3a8a' }} />
          </div>
        </div>

        {/* Team & work overview — admin (NO cash, NO money) */}
        <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: 0.4, marginBottom: 6 }}>VUE D'ENSEMBLE — 2 BOUTIQUES</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>47</div>
            <div style={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>commandes en cours</div>
          </div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>12 nouvelles aujourd'hui · 32 en production · 3 prêtes à livrer</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
            {[
              { l: 'En retard', v: '3', s: 'à traiter', alert: true },
              { l: 'Équipe', v: '7/9', s: 'en ligne' },
              { l: 'Carnet', v: '2', s: 'alertes' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'left', padding: 8, background: s.alert ? 'rgba(220,38,38,0.18)' : 'rgba(255,255,255,0.05)', borderRadius: 10, border: s.alert ? '1px solid rgba(252,165,165,0.4)' : 'none' }}>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: 0.3 }}>{s.l.toUpperCase()}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.alert ? '#fca5a5' : '#fff', marginTop: 1 }}>{s.v}</div>
                <div style={{ fontSize: 9.5, color: s.alert ? '#fca5a5' : 'rgba(255,255,255,0.5)', marginTop: 1 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ margin: '16px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: M.accent, letterSpacing: 0.4, marginBottom: 10 }}>● 3 ALERTES À TRAITER</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { t: 'Maquette Studio Maya — DANS 2H', s: 'Karim · CRITIQUE', col: M.accent, ic: 'fire' },
            { t: 'HP T520 — bourrages récurrents', s: 'Mehdi · matériel', col: '#f59e0b', ic: 'alert' },
            { t: 'Stock papier 250g — 8 feuilles', s: 'auto · à recommander', col: '#f59e0b', ic: 'package' },
          ].map((a, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 12, border: `1px solid ${M.border}`, borderLeft: `4px solid ${a.col}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: a.col + '14', color: a.col, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={a.ic === 'package' ? 'box' : a.ic === 'alert' ? 'fire' : 'fire'} size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.t}</div>
                <div style={{ fontSize: 10.5, color: M.muted, marginTop: 1 }}>{a.s}</div>
              </div>
              <Icon name="arrow" size={14} color={M.mutedSoft} />
            </div>
          ))}
        </div>
      </div>

      {/* Per-shop */}
      <div style={{ margin: '20px 16px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Par boutique</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { n: 'B1 · Bourguiba', cmd: 28, urg: 2, online: 4, total: 5 },
            { n: 'B2 · La Marsa', cmd: 19, urg: 1, online: 3, total: 4 },
          ].map(b => (
            <div key={b.n} style={{ background: '#fff', borderRadius: 12, padding: 12, border: `1px solid ${M.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: M.muted }}>{b.n}</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{b.cmd} <span style={{ fontSize: 11, color: M.muted, fontWeight: 600 }}>cmd</span></div>
              <div style={{ fontSize: 10.5, color: M.muted, marginTop: 2 }}>{b.urg} urgent{b.urg > 1 ? 's' : ''} · 🟢 {b.online}/{b.total}</div>
            </div>
          ))}
        </div>
      </div>

      <MobileTabBar active="home" role="admin" />
    </div>
  );
};

// ───────── Mobile Scan camera ─────────
const MobileScanCam = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#000', color: '#fff', fontFamily: FONT, position: 'relative', overflow: 'hidden' }}>
      {/* Faux camera feed: tilted paper */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1a1a1a 0%, #0d0d0d 100%)' }}>
        <div style={{
          position: 'absolute', top: '18%', left: '10%', width: '80%', height: '60%',
          background: 'linear-gradient(135deg, #fefae0, #f5edc6)', transform: 'rotate(-3deg) perspective(800px) rotateX(8deg)',
          borderRadius: 4, boxShadow: '0 30px 60px rgba(0,0,0,0.6)', padding: 20,
        }}>
          <div style={{ borderTop: '3px solid #1e3a8a', borderBottom: '3px solid #1e3a8a', padding: '8px 0', textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a', letterSpacing: 0.5 }}>EL BENNA</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#dc2626', letterSpacing: 1 }}>RECEPTION POCHETTE</div>
          </div>
          <div style={{ fontSize: 9, color: '#1e3a8a', fontWeight: 700 }}>N° 0061340</div>
          <div style={{ marginTop: 10, fontFamily: 'cursive', fontSize: 10, color: '#1f2937', lineHeight: 1.6 }}>
            Khelifi Abdelwahab<br/>
            50 cartes visite carton 250g<br/>
            Logo PDF en pj — URGENT auj.
          </div>
        </div>
      </div>

      {/* Scanning overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      {/* Scan frame */}
      <div style={{ position: 'absolute', top: '20%', left: '8%', width: '84%', height: '58%', borderRadius: 12, boxShadow: '0 0 0 2000px rgba(0,0,0,0.5)' }}>
        {/* corners */}
        {[
          { t: 0, l: 0, br: 'r b' }, { t: 0, r: 0, br: 'l b' },
          { b: 0, l: 0, br: 'r t' }, { b: 0, r: 0, br: 'l t' },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: 30, height: 30,
            top: c.t, left: c.l, right: c.r, bottom: c.b,
            borderTop: !c.br.includes('t') ? `4px solid ${M.accent}` : 'none',
            borderBottom: !c.br.includes('b') ? `4px solid ${M.accent}` : 'none',
            borderLeft: !c.br.includes('l') ? `4px solid ${M.accent}` : 'none',
            borderRight: !c.br.includes('r') ? `4px solid ${M.accent}` : 'none',
            borderRadius: 4,
          }} />
        ))}
        {/* scan line */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: M.accent, boxShadow: `0 0 12px ${M.accent}` }} />
      </div>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 54, left: 0, right: 0, padding: '0 18px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={16} color="#fff" stroke={2.4} />
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>Scanner pochette</div>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bolt" size={16} color="#fff" />
        </div>
      </div>

      {/* Hint */}
      <div style={{ position: 'absolute', top: '12%', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
        <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
          📄 Cadre la pochette dans le rectangle
        </div>
      </div>

      {/* Status */}
      <div style={{ position: 'absolute', bottom: 240, left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(22,163,74,0.95)', borderRadius: 999, fontSize: 13, fontWeight: 700, boxShadow: '0 6px 20px rgba(22,163,74,0.5)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff' }} />
          Pochette détectée — analyse IA…
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 32px', zIndex: 10 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="image" size={22} color="#fff" />
        </div>
        <div style={{ width: 80, height: 80, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px rgba(255,255,255,0.25)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: M.accent }} />
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="search" size={22} color="#fff" />
        </div>
      </div>
    </div>
  );
};

// ───────── Mobile Scan result (bottom sheet) ─────────
const MobileScanResult = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#000', color: '#fff', fontFamily: FONT, position: 'relative', overflow: 'hidden' }}>
      {/* dimmed photo bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1a1a1a, #0d0d0d)', filter: 'blur(2px) brightness(0.5)' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '15%', width: '70%', height: '40%',
          background: 'linear-gradient(135deg, #fefae0, #f5edc6)', transform: 'rotate(-3deg)',
          borderRadius: 4, boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#fff', color: M.text,
        borderRadius: '24px 24px 0 0', padding: '12px 0 110px',
        maxHeight: '78%', overflow: 'auto',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: M.border, margin: '0 auto 14px' }} />
        <div style={{ padding: '0 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: M.success + '14', color: M.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={22} stroke={3} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: M.success, letterSpacing: 0.4 }}>SCAN RÉUSSI · CONFIANCE 96%</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>Pochette analysée</div>
            </div>
          </div>

          {/* Detected fields */}
          <div style={{ background: M.bg, borderRadius: 12, padding: 12, marginBottom: 14 }}>
            {[
              { l: 'Pochette N°', v: '0061340', conf: 99 },
              { l: 'Client', v: 'Khelifi Abdelwahab', conf: 92 },
              { l: 'Description', v: '50 cartes visite carton 250g', conf: 88 },
              { l: 'Urgence', v: 'AUJOURD\'HUI · 17H', conf: 85, urgent: true },
            ].map((f, i) => (
              <div key={i} style={{ padding: '8px 0', borderTop: i ? `1px solid ${M.border}` : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: M.muted, fontWeight: 600, letterSpacing: 0.4 }}>{f.l.toUpperCase()}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: f.urgent ? M.accent : M.text, marginTop: 1 }}>{f.v}</div>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: f.conf >= 90 ? '#dcfce7' : '#fef3c7', color: f.conf >= 90 ? '#166534' : '#854d0e' }}>{f.conf}%</span>
              </div>
            ))}
          </div>

          {/* Match found */}
          <div style={{ padding: 12, background: M.primary + '0d', border: `1px solid ${M.primary}33`, borderRadius: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 999, background: M.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>AK</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: M.primary, fontWeight: 700 }}>✓ Client trouvé en base</div>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>Abdelwahab Khelifi · 5e commande</div>
              <div style={{ fontSize: 10.5, color: M.muted }}>+216 22 345 678 · habitué carto</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{ height: 50, borderRadius: 12, border: 'none', background: M.success, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 14px ${M.success}55` }}>
              <Icon name="check" size={18} stroke={3} /> Créer la commande
            </button>
            <button style={{ height: 44, borderRadius: 12, border: `1px solid ${M.border}`, background: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT, color: M.text }}>
              Modifier les champs
            </button>
            <button style={{ height: 38, borderRadius: 8, border: 'none', background: 'transparent', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: FONT, color: M.muted }}>
              Re-scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────── Mobile Carnet feed ─────────
const MobileCarnet = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: M.bg, fontFamily: FONT, color: M.text, paddingTop: 54, paddingBottom: 130, overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 12px', background: '#fff', borderBottom: `1px solid ${M.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 19, fontWeight: 800, flex: 1 }}>📓 Carnet</div>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: M.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={20} stroke={2.6} />
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, overflow: 'auto' }}>
          {[
            { l: 'Pour moi', n: 3, active: true, hot: true },
            { l: 'Tous', n: 12 },
            { l: 'Ma boutique' },
            { l: 'Tâches', n: 8 },
            { l: 'Alertes', n: 2 },
          ].map(t => (
            <div key={t.l} style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              background: t.active ? M.primary : M.bg,
              color: t.active ? '#fff' : (t.hot ? M.accent : M.text),
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>{t.l} {t.n != null && <span style={{ background: t.active ? 'rgba(255,255,255,0.25)' : (t.hot ? M.accent : M.border), color: t.active || t.hot ? '#fff' : M.muted, padding: '0 5px', borderRadius: 999, fontSize: 9.5, fontWeight: 800 }}>{t.n}</span>}</div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { type: 'ALERT', col: '#dc2626', who: 'Sonia', t: 'Maquette Studio Maya — DANS 2H', body: 'Cliente passée ce matin, voici les corrections : police prénom, recentrer photo, fond ivoire.', time: 'il y a 15 min', urg: 'CRITIQUE', new: true, order: 'LB-…0039' },
          { type: 'PASSATION', col: '#3b82f6', who: 'Karim', t: 'Maquette validée — à imprimer', body: '@Mehdi 200 ex carton 250g, finition mate. PDF en pj.', time: '14:38', urg: null, order: 'LB-…0042', replies: 3, new: true },
          { type: 'TÂCHE', col: '#f59e0b', who: 'Adel', t: 'Refaire logo Resto Dar Yassmine V3', body: 'Le client a renvoyé ses photos finales. À faire avant mer. 18h.', time: 'il y a 1h', urg: 'HAUTE', new: true, order: 'LB-…0037' },
          { type: 'QUESTION', col: '#8b5cf6', who: 'Yosra', t: 'Tarif sublimation casquette ?', body: 'Une cliente demande pour 12 casquettes brodées. Pas vu le prix dans le catalogue.', time: 'il y a 2h', urg: null, replies: 2 },
        ].map((p, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 12, border: `1px solid ${M.border}`, borderLeft: `4px solid ${p.col}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: p.col, letterSpacing: 0.4 }}>{p.type}</span>
              {p.urg && <span style={{ fontSize: 9, fontWeight: 800, color: M.accent, background: M.accentSoft, padding: '1px 5px', borderRadius: 3 }}>● {p.urg}</span>}
              <div style={{ flex: 1 }} />
              {p.new && <span style={{ width: 6, height: 6, borderRadius: 999, background: M.primary }} />}
              <span style={{ fontSize: 10, color: M.muted }}>{p.time}</span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, marginBottom: 3 }}>{p.t}</div>
            <div style={{ fontSize: 11.5, color: M.text, lineHeight: 1.4, opacity: 0.85, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.body}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 10.5, color: M.muted }}>
              <span>{p.who}</span>
              {p.order && <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', color: M.primary, fontWeight: 700 }}>· {p.order}</span>}
              {p.replies && <span style={{ marginLeft: 'auto' }}>💬 {p.replies}</span>}
            </div>
          </div>
        ))}
      </div>

      <MobileTabBar active="carnet" role="team" />
    </div>
  );
};

// ───────── Mobile Order detail ─────────
const MobileOrderDetail = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: M.bg, fontFamily: FONT, color: M.text, paddingTop: 54, paddingBottom: 130, overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 14px', background: '#fff', borderBottom: `1px solid ${M.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Icon name="arrow" size={20} color={M.text} style={{ transform: 'rotate(180deg)' }} />
          <div style={{ flex: 1, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, color: M.muted }}>LB-202605-0042</div>
          <Icon name="more" size={18} color={M.muted} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 9.5, fontWeight: 800, padding: '3px 7px', borderRadius: 4, background: M.accent, color: '#fff' }}>● URGENT</span>
          <span style={{ fontSize: 9.5, fontWeight: 800, padding: '3px 7px', borderRadius: 4, background: '#06b6d4', color: '#fff' }}>EN PRODUCTION</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.25 }}>50 cartes visite carton 250g</div>
        <div style={{ fontSize: 12, color: M.muted, marginTop: 3 }}>Abdelwahab Khelifi · livraison auj. 17h</div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', padding: '14px 16px', borderBottom: `1px solid ${M.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Reçu', 'Maq.', 'Valid.', 'Prod.', 'Prête'].map((s, i) => {
            const done = i < 3;
            const active = i === 3;
            return (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 999,
                    background: done ? M.success : (active ? '#06b6d4' : M.border),
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800,
                    boxShadow: active ? '0 0 0 4px #06b6d433' : 'none',
                  }}>{done ? '✓' : i + 1}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: active ? '#06b6d4' : (done ? M.success : M.mutedSoft), marginTop: 3 }}>{s}</div>
                </div>
                {i < 4 && <div style={{ flex: 1, height: 2, background: i < 3 ? M.success : M.border, borderRadius: 999, marginTop: -16 }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content scroll */}
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', background: M.success, color: '#fff', fontWeight: 800, fontSize: 12, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="check" size={14} stroke={3} /> Avancer statut
          </button>
          <button style={{ height: 40, padding: '0 14px', borderRadius: 10, border: `1px solid ${M.border}`, background: '#fff', fontWeight: 700, fontSize: 12, fontFamily: FONT, color: M.text, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon name="phone" size={14} /> Appeler
          </button>
        </div>

        {/* Pochette photo */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, border: `1px solid ${M.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: M.muted, letterSpacing: 0.4, marginBottom: 8 }}>POCHETTE PAPIER · #0061340</div>
          <div style={{ height: 110, borderRadius: 8, background: 'linear-gradient(135deg, #fefae0, #f5edc6)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{ fontFamily: 'cursive', color: '#1f2937', fontSize: 11, transform: 'rotate(-2deg)', textAlign: 'center', lineHeight: 1.6, padding: 8 }}>
              <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: 13 }}>EL BENNA</div>
              <div style={{ fontSize: 8, color: '#dc2626', letterSpacing: 1 }}>RECEPTION POCHETTE</div>
              <div style={{ marginTop: 8 }}>Khelifi Abdelwahab<br/>50 cartes visite 250g<br/>URGENT 17h</div>
            </div>
            <div style={{ position: 'absolute', top: 6, right: 6, padding: '2px 6px', background: '#000', color: '#fff', fontSize: 8.5, borderRadius: 3, fontWeight: 700 }}>SCANNÉE 14:22</div>
          </div>
        </div>

        {/* Carnet timeline */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, border: `1px solid ${M.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 800, flex: 1 }}>📓 Carnet de la commande</span>
            <span style={{ fontSize: 10, fontWeight: 800, background: M.primary, color: '#fff', padding: '2px 6px', borderRadius: 999 }}>4</span>
          </div>
          {[
            { who: 'Karim', t: 'Maquette validée — à imprimer', when: '14:38', col: '#3b82f6' },
            { who: 'Sonia', t: '@Karim numéro client ?', when: '14:25', col: '#8b5cf6' },
            { who: 'Sonia', t: 'Pochette scannée · scan IA 96%', when: '14:22', col: '#64748b' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0' }}>
              <div style={{ width: 7, height: 7, borderRadius: 999, background: e.col, marginTop: 6, flex: '0 0 auto' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{e.t}</div>
                <div style={{ fontSize: 10, color: M.muted }}>{e.who} · {e.when}</div>
              </div>
            </div>
          ))}
          <button style={{ width: '100%', marginTop: 8, height: 32, borderRadius: 8, border: `1px dashed ${M.border}`, background: 'transparent', fontSize: 11.5, color: M.muted, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>+ Poster sur ce carnet</button>
        </div>
      </div>

      <MobileTabBar active="orders" role="team" />
    </div>
  );
};

// ───────── Tablet — landscape ─────────
const TabletHome = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: M.bg, fontFamily: FONT, color: M.text, display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Side rail */}
      <div style={{ width: 92, background: M.bgDark, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 6 }}>
        <Logo size={28} withText={false} invert />
        <div style={{ flex: 1, marginTop: 24, display: 'flex', flexDirection: 'column', gap: 4, width: '100%', padding: '0 12px' }}>
          {[
            { i: 'home', l: 'Accueil', a: true },
            { i: 'list', l: 'Cmd' },
            { i: 'file', l: 'Carnet', n: 3 },
            { i: 'kanban', l: 'Flux' },
            { i: 'users', l: 'Clients' },
          ].map(t => (
            <div key={t.i} style={{
              padding: '10px 0', borderRadius: 12,
              background: t.a ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: t.a ? '#fff' : 'rgba(255,255,255,0.6)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative',
            }}>
              <Icon name={t.i} size={20} stroke={2} />
              <span style={{ fontSize: 9.5, fontWeight: 700 }}>{t.l}</span>
              {t.n && <span style={{ position: 'absolute', top: 4, right: 16, minWidth: 14, height: 14, padding: '0 4px', borderRadius: 999, background: M.accent, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.n}</span>}
            </div>
          ))}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 999, background: '#a855f7', color: '#fff', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>KA</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto', paddingBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: M.muted }}>Sam. 9 mai · 14:38</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Bonjour Karim 👋</div>
          </div>
          <div style={{ height: 44, padding: '0 16px', borderRadius: 22, background: '#fff', border: `1px solid ${M.border}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: M.muted, minWidth: 280 }}>
            <Icon name="search" size={16} /> Chercher commande, client...
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {/* Left: orders */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Mes commandes en cours · 7</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { c: 'LB-…0042', t: '50 cartes visite carton', cl: 'A. Khelifi', tag: 'EN PROD.', col: '#06b6d4', urg: true },
                { c: 'LB-…0037', t: 'Logo Resto Dar Yassmine V3', cl: 'O. Mejri', tag: 'À FAIRE', col: '#f59e0b' },
                { c: 'LB-…0033', t: 'Affiches A2 — 12 ex', cl: 'Studio Maya', tag: 'MAQUETTE', col: '#8b5cf6', urg: true },
                { c: 'LB-…0028', t: '24 t-shirts sublimation', cl: 'École Al Amal', tag: 'PROD.', col: '#06b6d4' },
              ].map(o => (
                <div key={o.c} style={{ background: '#fff', borderRadius: 12, padding: 12, border: `1px solid ${M.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: M.primary }}>{o.c}</span>
                    {o.urg && <span style={{ fontSize: 8.5, fontWeight: 800, color: M.accent, background: M.accentSoft, padding: '1px 5px', borderRadius: 3 }}>URG</span>}
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: o.col, padding: '2px 6px', background: o.col + '14', borderRadius: 3 }}>{o.tag}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{o.t}</div>
                  <div style={{ fontSize: 10.5, color: M.muted, marginTop: 2 }}>{o.cl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: carnet */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, flex: 1 }}>📓 Pour moi</span>
              <span style={{ fontSize: 10, fontWeight: 800, background: M.accent, color: '#fff', padding: '2px 7px', borderRadius: 999 }}>3</span>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${M.border}`, overflow: 'hidden' }}>
              {[
                { c: '#dc2626', l: 'CRITIQUE', t: 'Studio Maya — DANS 2H', w: 'Sonia · 15min' },
                { c: '#3b82f6', l: 'PASSATION', t: 'Maquette validée — imprimer', w: 'Karim · 14:38' },
                { c: '#f59e0b', l: 'TÂCHE', t: 'Refaire logo Dar Yassmine V3', w: 'Adel · 1h' },
                { c: '#8b5cf6', l: 'QUESTION', t: 'fond transparent ?', w: 'Yosra · 4h' },
              ].map((p, i) => (
                <div key={i} style={{ padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10, borderTop: i ? `1px solid ${M.border}` : 'none' }}>
                  <div style={{ width: 3, height: 30, background: p.c, borderRadius: 999 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 800, color: p.c, letterSpacing: 0.4 }}>{p.l}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{p.t}</div>
                    <div style={{ fontSize: 10, color: M.muted }}>{p.w}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating SCAN button — tablet */}
      <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 10 }}>
        <div style={{
          height: 64, padding: '0 26px 0 22px', borderRadius: 999,
          background: `linear-gradient(135deg, ${M.accent}, #b91c1c)`,
          color: '#fff', display: 'flex', alignItems: 'center', gap: 12,
          fontWeight: 800, fontSize: 16, boxShadow: `0 14px 40px ${M.accent}88`,
          border: '4px solid #fff',
        }}>
          <span style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="scan" size={22} stroke={2.5} />
          </span>
          SCANNER POCHETTE
        </div>
      </div>
    </div>
  );
};

// Frame helper for canvas
const PhoneFrame = ({ children, w = 390, h = 780, dark = false }) => (
  <div style={{
    width: w + 16, height: h + 16, padding: 8,
    background: dark ? '#000' : '#1a1a1a', borderRadius: 56,
    boxShadow: '0 30px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.1)',
    position: 'relative',
  }}>
    <div style={{ width: w, height: h, borderRadius: 48, overflow: 'hidden', background: '#fff', position: 'relative' }}>
      {/* dynamic island */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 110, height: 32, borderRadius: 22, background: '#000', zIndex: 100 }} />
      {/* status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', zIndex: 50, fontFamily: '-apple-system, system-ui', fontSize: 14, fontWeight: 700, color: children?.props?.darkBar ? '#fff' : '#000' }}>
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11 }}>●●●●</span>
          <span style={{ fontSize: 11 }}>📶</span>
          <span style={{ fontSize: 11 }}>🔋</span>
        </span>
      </div>
      <div style={{ width: '100%', height: '100%' }}>{children}</div>
      {/* home indicator */}
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 999, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} />
    </div>
  </div>
);

window.MobileLogin = MobileLogin;
window.MobilePIN = MobilePIN;
window.MobileHomeTeam = MobileHomeTeam;
window.MobileHomeAdmin = MobileHomeAdmin;
window.MobileScanCam = MobileScanCam;
window.MobileScanResult = MobileScanResult;
window.MobileCarnet = MobileCarnet;
window.MobileOrderDetail = MobileOrderDetail;
window.TabletHome = TabletHome;
window.PhoneFrame = PhoneFrame;
