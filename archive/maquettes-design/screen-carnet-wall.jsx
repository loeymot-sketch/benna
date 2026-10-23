// EL BENNA LAB OS — Le Carnet (Team Hub) screens
// Module de communication interne structuré

const POST_TYPES = {
  HANDOFF:       { color: '#3b82f6', icon: 'arrow',  fr: 'Passation',          emoji: '🔄', short: 'Passation' },
  TASK:          { color: '#f59e0b', icon: 'check',  fr: 'Tâche',              emoji: '✅', short: 'Tâche' },
  ABSENCE_NOTE:  { color: '#14b8a6', icon: 'sun',    fr: 'Absence',            emoji: '🌴', short: 'Absence' },
  QUESTION:      { color: '#8b5cf6', icon: 'help',   fr: 'Question',           emoji: '❓', short: 'Question' },
  ANNOUNCEMENT:  { color: '#dc2626', icon: 'mega',   fr: 'Annonce',            emoji: '📢', short: 'Annonce' },
  ALERT:         { color: '#ea580c', icon: 'warn',   fr: 'Alerte',             emoji: '⚠️', short: 'Alerte' },
  NOTE:          { color: '#64748b', icon: 'edit',   fr: 'Note',               emoji: '📝', short: 'Note' },
  SHIFT_HANDOVER:{ color: '#7c3aed', icon: 'clock',  fr: 'Passation de shift', emoji: '🗓️', short: 'Shift' },
};

// Add icons used by Carnet module
const CarnetIcons = {
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1 1.2-1 2.2"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></>,
  mega: <><path d="M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M19 8a4 4 0 0 1 0 8"/></>,
  warn: <><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.01"/></>,
};

const PostIcon = ({ name, size = 16, color = 'currentColor' }) => {
  if (CarnetIcons[name]) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {CarnetIcons[name]}
      </svg>
    );
  }
  return <Icon name={name} size={size} color={color} />;
};

// People
const PEOPLE = {
  AD: { name: 'Adel',    role: 'Admin',         color: 'linear-gradient(135deg,#f59e0b,#dc2626)' },
  SO: { name: 'Sonia',   role: 'Réception',     color: 'linear-gradient(135deg,#3b82f6,#1e3a8a)' },
  KA: { name: 'Karim',   role: 'Designer',      color: 'linear-gradient(135deg,#a855f7,#6d28d9)' },
  ME: { name: 'Mehdi',   role: 'Production',    color: 'linear-gradient(135deg,#f97316,#dc2626)' },
  YO: { name: 'Yosra',   role: 'Réception',     color: 'linear-gradient(135deg,#14b8a6,#0f766e)' },
  NI: { name: 'Nizar',   role: 'Photographe',   color: 'linear-gradient(135deg,#84cc16,#16a34a)' },
  SA: { name: 'Salem',   role: 'Imprimeur',     color: 'linear-gradient(135deg,#0ea5e9,#0369a1)' },
  AH: { name: 'Ahmed',   role: 'Designer',      color: 'linear-gradient(135deg,#ec4899,#be185d)' },
};

const Avatar = ({ id, size = 28, ring = false }) => {
  const p = PEOPLE[id] || { name: '?', color: '#94a3b8' };
  const init = id;
  return (
    <span style={{
      width: size, height: size, borderRadius: 999,
      background: p.color,
      color: '#fff', fontWeight: 700,
      fontSize: size * 0.42,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flex: '0 0 auto',
      boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${COLORS.primary}` : 'none',
    }}>{init}</span>
  );
};

// ───────────────────────── Sidebar with Carnet item ─────────────────────────
const SidebarWithCarnet = ({ active, badges = {} }) => {
  const items = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'home' },
    { id: 'kanban', label: 'Kanban', icon: 'kanban' },
    { id: 'orders', label: 'Commandes', icon: 'list', count: 47 },
    { id: 'scan', label: 'Scanner pochette', icon: 'scan', highlight: true },
    { id: 'carnet', label: 'Le Carnet', icon: 'msg', badge: badges.carnet ?? 4, accent: true },
    { id: 'inbox', label: 'Pour Moi', icon: 'bell', badge: badges.inbox ?? 3 },
    { id: 'absences', label: 'Absences', icon: 'sun' },
    { id: 'customers', label: 'Clients', icon: 'users' },
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
              background: isActive ? COLORS.primary + '14' : (it.accent && !isActive ? '#fffbeb' : 'transparent'),
              cursor: 'pointer',
            }}>
              <PostIcon name={it.icon} size={17} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.badge != null && it.badge > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                  borderRadius: 999, background: COLORS.accent, color: '#fff',
                }}>{it.badge}</span>
              )}
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
        <Avatar id="SO" size={34} />
        <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>Sonia · Réception</div>
          <div style={{ fontSize: 11, color: COLORS.muted }}>Boutique 1</div>
        </div>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.success }} />
      </div>
    </aside>
  );
};

// ───────────────────────── Post card ─────────────────────────
const PostCard = ({ type, author, time, title, body, recipient, order, urgency, status, reactions = [], replies = 0, pinned = false, deadline, attachments = 0 }) => {
  const T = POST_TYPES[type];
  const statusMap = {
    OPEN: { c: '#3b82f6', l: 'Ouvert' },
    SEEN: { c: '#94a3b8', l: 'Vu' },
    RESOLVED: { c: COLORS.success, l: 'Résolu' },
  };
  const st = statusMap[status] || statusMap.OPEN;
  return (
    <div style={{
      background: '#fff', border: `1px solid ${COLORS.border}`,
      borderRadius: 12, padding: 14, marginBottom: 10,
      borderLeft: `4px solid ${T.color}`,
      boxShadow: pinned ? `0 1px 2px rgba(0,0,0,0.04), 0 0 0 2px #fef3c7` : '0 1px 2px rgba(0,0,0,0.03)',
      position: 'relative',
    }}>
      {pinned && (
        <span style={{
          position: 'absolute', top: -6, left: 12,
          padding: '2px 8px', borderRadius: 999,
          background: '#fbbf24', color: '#78350f',
          fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
        }}>📌 ÉPINGLÉ</span>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Avatar id={author} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: COLORS.muted, marginBottom: 2, flexWrap: 'wrap' }}>
            <b style={{ color: COLORS.text }}>{PEOPLE[author].name}</b>
            <span style={{ color: COLORS.mutedSoft }}>·</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '1px 7px', borderRadius: 999,
              background: T.color + '14', color: T.color, fontWeight: 700, fontSize: 10.5,
            }}>
              <PostIcon name={T.icon} size={10} /> {T.short}
            </span>
            {urgency === 'CRITICAL' && (
              <span style={{ padding: '1px 7px', borderRadius: 999, background: COLORS.danger, color: '#fff', fontSize: 10, fontWeight: 700 }}>🚨 URGENT</span>
            )}
            {urgency === 'HIGH' && (
              <span style={{ padding: '1px 7px', borderRadius: 999, background: '#fbbf24', color: '#78350f', fontSize: 10, fontWeight: 700 }}>HAUTE</span>
            )}
            <span style={{ color: COLORS.mutedSoft }}>·</span>
            <span>{time}</span>
            {recipient && <>
              <span style={{ color: COLORS.mutedSoft }}>→</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {typeof recipient === 'string' ? recipient : <>
                  <Avatar id={recipient.id} size={16} /> {recipient.name}
                </>}
              </span>
            </>}
            <div style={{ flex: 1 }} />
            <span style={{
              padding: '1px 7px', borderRadius: 999,
              background: st.c + '14', color: st.c, fontWeight: 700, fontSize: 10,
            }}>● {st.l}</span>
          </div>

          {title && <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>{title}</div>}
          <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{body}</div>

          {/* Order link */}
          {order && (
            <div style={{
              marginTop: 8, padding: '6px 10px', borderRadius: 8,
              background: COLORS.bg, border: `1px solid ${COLORS.border}`,
              display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, cursor: 'pointer',
            }}>
              <Icon name="file" size={12} color={COLORS.primary} />
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 700, color: COLORS.primary }}>{order.code}</span>
              <span style={{ color: COLORS.muted }}>· {order.label}</span>
              {order.urgency && <UrgencyDot level={order.urgency} />}
            </div>
          )}

          {/* Deadline */}
          {deadline && (
            <div style={{
              marginTop: 6, fontSize: 11, color: deadline.late ? COLORS.danger : COLORS.warning, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <Icon name="clock" size={11} /> {deadline.label}
            </div>
          )}

          {/* Footer: reactions, replies, attach */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: COLORS.muted }}>
            {reactions.length > 0 && (
              <div style={{ display: 'flex', gap: 4 }}>
                {reactions.map((r, i) => (
                  <span key={i} style={{
                    padding: '2px 7px', borderRadius: 999,
                    background: r.mine ? COLORS.primary + '14' : COLORS.bg,
                    border: `1px solid ${r.mine ? COLORS.primary + '44' : COLORS.border}`,
                    fontSize: 11, fontWeight: 600,
                    color: r.mine ? COLORS.primary : COLORS.text,
                    cursor: 'pointer',
                  }}>{r.emoji} {r.n}</span>
                ))}
                <span style={{
                  padding: '2px 7px', borderRadius: 999,
                  border: `1px dashed ${COLORS.borderStrong}`, fontSize: 11, color: COLORS.mutedSoft, cursor: 'pointer',
                }}>+</span>
              </div>
            )}
            {attachments > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Icon name="image" size={11} /> {attachments} pièce{attachments > 1 ? 's' : ''} jointe{attachments > 1 ? 's' : ''}
              </span>
            )}
            {replies > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: COLORS.primary, fontWeight: 600, cursor: 'pointer' }}>
                <Icon name="msg" size={11} /> {replies} réponse{replies > 1 ? 's' : ''}
              </span>
            )}
            <div style={{ flex: 1 }} />
            {status !== 'RESOLVED' && type === 'TASK' && (
              <button style={{
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: COLORS.success, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}><Icon name="check" size={11} stroke={3} /> Marquer fait</button>
            )}
            {status !== 'RESOLVED' && type === 'HANDOFF' && (
              <button style={{
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: COLORS.primary, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
              }}>Je prends ✋</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────── Le Carnet — Wall ─────────────────────────
const CarnetWall = () => {
  const filters = ['Tous', 'À moi', 'Ma boutique', "Aujourd'hui", 'Tâches ouvertes', 'Non lus', 'Urgent'];

  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <SidebarWithCarnet active="carnet" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>📓 Le Carnet</span>}
          subtitle="Communication interne · 4 nouveaux items · 2 absences cette semaine"
        />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
            {/* Main feed */}
            <div>
              {/* Pinned section */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                  📌 Épinglés
                </div>
                <PostCard
                  type="ANNOUNCEMENT"
                  author="AD" time="il y a 1 j"
                  title="Réunion d'équipe samedi 10h00"
                  body="Petit déjeuner offert avant. On fera le point sur la saison mariage qui démarre + retour client sur les nouveaux photobooks. Présence souhaitée des 2 boutiques."
                  recipient="Toute l'équipe"
                  status="OPEN"
                  pinned
                  reactions={[{ emoji: '👍', n: 6, mine: true }, { emoji: '✅', n: 3 }]}
                  replies={2}
                />
              </div>

              {/* Absences */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                  🌴 Absences en cours / à venir
                </div>
                <div style={{
                  background: '#f0fdfa', border: `1px solid #99f6e4`, borderRadius: 12, padding: 12,
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                }}>
                  {[
                    { who: 'NI', dates: '11 → 13 mai', reason: 'Formation studio · Tunis', sub: 'KA' },
                    { who: 'ME', dates: '18 mai (1 jour)', reason: 'RDV médical', sub: 'SA' },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px' }}>
                      <Avatar id={a.who} size={32} />
                      <div style={{ flex: 1, minWidth: 0, fontSize: 12 }}>
                        <div style={{ fontWeight: 600 }}>{PEOPLE[a.who].name} · {a.dates}</div>
                        <div style={{ color: '#0f766e', fontSize: 11 }}>{a.reason}</div>
                      </div>
                      <div style={{ fontSize: 10, color: COLORS.muted, textAlign: 'right', lineHeight: 1.3 }}>
                        urgences →<br/><b style={{ color: COLORS.text }}>{PEOPLE[a.sub].name}</b>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                  ⚠️ Alertes ouvertes
                </div>
                <PostCard
                  type="ALERT"
                  author="ME" time="il y a 2 h"
                  title="Imprimante grand format — bourrages répétés"
                  body="3e bourrage ce matin sur le rouleau bâche 1m20. J'ai nettoyé les rouleaux mais ça recommence. Probable problème mécanique. Il faut appeler la maintenance avant lundi sinon on ne pourra pas livrer la commande Salon Massinissa."
                  recipient="Boutique 1"
                  urgency="HIGH"
                  status="OPEN"
                  reactions={[{ emoji: '👀', n: 2 }, { emoji: '🚨', n: 1 }]}
                  replies={3}
                />
              </div>

              {/* Recent flow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>
                🔄 Flux récent
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {filters.map((f, i) => (
                  <span key={f} style={{
                    padding: '5px 11px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                    background: i === 0 ? COLORS.primary : '#fff', color: i === 0 ? '#fff' : COLORS.text,
                    border: `1px solid ${i === 0 ? COLORS.primary : COLORS.border}`, cursor: 'pointer',
                  }}>{f}</span>
                ))}
              </div>

              <PostCard
                type="HANDOFF"
                author="AH" time="il y a 3 min"
                recipient={{ id: 'SA', name: 'Salem' }}
                body={<>Maquette validée par le client (capture ci-jointe). À <b>imprimer en 50 ex</b> sur carton 250g, finition <b>mate</b>. Pas de pelliculage. Le client passe à 17h pour récupérer.</>}
                order={{ code: 'LB-202605-0042', label: 'Abdelwahab Khelifi · 50 cartes visite', urgency: 'URGENT' }}
                urgency="HIGH"
                status="OPEN"
                attachments={2}
                reactions={[{ emoji: '👀', n: 1, mine: true }]}
                deadline={{ label: "À prendre avant 15h00 · dans 1h 12min", late: false }}
              />

              <PostCard
                type="QUESTION"
                author="YO" time="il y a 12 min"
                recipient="Tous les designers"
                body={<>Une cliente demande un <b>logo + carte visite + faire-part mariage</b> pour fin du mois. Elle veut un devis groupé. Quel tarif vous proposeriez ? Elle attend ma réponse au comptoir.</>}
                urgency="HIGH"
                status="OPEN"
                reactions={[{ emoji: '👀', n: 2 }]}
                replies={1}
                deadline={{ label: 'Réponse souhaitée maintenant — cliente au comptoir', late: false }}
              />

              <PostCard
                type="TASK"
                author="AD" time="il y a 1 h"
                recipient={{ id: 'SO', name: 'Sonia' }}
                title="Rappeler M. Trabelsi pour récupérer LB-…0040"
                body={<>Sa commande est <b>prête depuis hier 16h</b>, elle attend au comptoir et il n'a pas répondu au SMS automatique. Tenter un appel direct + WhatsApp. Si pas de réponse d'ici lundi, on relance par email.</>}
                order={{ code: 'LB-202605-0040', label: 'Mohamed Trabelsi · t-shirts + mugs' }}
                urgency="NORMAL"
                status="OPEN"
                reactions={[{ emoji: '✅', n: 1, mine: false }]}
                deadline={{ label: 'Avant lundi 12 mai', late: false }}
              />

              <PostCard
                type="NOTE"
                author="KA" time="il y a 2 h"
                recipient="Toute l'équipe"
                body="J'ai mis à jour la grille tarifaire des photobooks dans le catalogue. Le format A4 30 pages passe de 175 à 185 TND (hausse fournisseur sur le cuir). On en a parlé avec Adel hier."
                status="SEEN"
                reactions={[{ emoji: '👍', n: 4 }]}
              />

              <PostCard
                type="HANDOFF"
                author="KA" time="hier 17h42"
                recipient={{ id: 'SA', name: 'Salem' }}
                body="Photobook mariage Hela Ben Romdhane prêt côté design. Tous les fichiers PDF haute déf sont dans le dossier partagé. Couverture cuir bordeaux comme convenu, livraison lundi matin."
                order={{ code: 'LB-202605-0041', label: 'Hela Ben Romdhane · photobook A4 30p', urgency: 'PRIORITAIRE' }}
                status="RESOLVED"
                reactions={[{ emoji: '✅', n: 1 }, { emoji: '👍', n: 2 }]}
                attachments={1}
              />
            </div>

            {/* Right rail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button style={{
                height: 48, borderRadius: 12, border: 'none',
                background: COLORS.accent, color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: FONT,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
              }}>
                <Icon name="plus" size={16} /> Nouveau post
              </button>

              {/* Stats */}
              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: COLORS.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>Activité de la semaine</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { l: 'Posts', v: 47, c: COLORS.primary },
                    { l: 'Tâches résolues', v: 18, c: COLORS.success },
                    { l: 'Passations', v: 23, c: '#3b82f6' },
                    { l: 'Alertes ouvertes', v: 1, c: COLORS.danger },
                  ].map(s => (
                    <div key={s.l} style={{ padding: 10, background: COLORS.bg, borderRadius: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.c, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Who's here */}
              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: COLORS.muted, letterSpacing: 0.4, textTransform: 'uppercase' }}>Présents aujourd'hui</div>
                {[
                  { id: 'AD', s: 'online' }, { id: 'SO', s: 'online' }, { id: 'KA', s: 'busy' },
                  { id: 'ME', s: 'online' }, { id: 'YO', s: 'away' }, { id: 'SA', s: 'online' }, { id: 'AH', s: 'online' },
                ].map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 12 }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar id={p.id} size={24} />
                      <span style={{
                        position: 'absolute', right: -1, bottom: -1, width: 8, height: 8, borderRadius: 999,
                        background: p.s === 'online' ? COLORS.success : p.s === 'busy' ? COLORS.warning : COLORS.mutedSoft,
                        border: '2px solid #fff',
                      }} />
                    </div>
                    <span style={{ flex: 1, fontWeight: 600 }}>{PEOPLE[p.id].name}</span>
                    <span style={{ color: COLORS.muted, fontSize: 11 }}>{PEOPLE[p.id].role}</span>
                  </div>
                ))}
                <div style={{ paddingTop: 8, marginTop: 8, borderTop: `1px solid ${COLORS.border}`, fontSize: 11.5, color: COLORS.muted }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    🌴 <span><b>Nizar</b> en formation jusqu'au 13 mai</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────── Pour Moi (Inbox) ─────────────────────────
const PourMoiScreen = () => {
  const tabs = [
    { id: 'todo', label: 'À traiter', count: 5, active: true },
    { id: 'follow', label: 'À suivre', count: 3 },
    { id: 'archive', label: 'Vu / Archive', count: 28 },
  ];
  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <SidebarWithCarnet active="inbox" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="Pour Moi" subtitle="Sonia · ce qui t'attend personnellement" />
        <div style={{
          padding: '0 24px', borderBottom: `1px solid ${COLORS.border}`,
          background: COLORS.panel, display: 'flex', gap: 4,
        }}>
          {tabs.map(t => (
            <div key={t.id} style={{
              padding: '12px 16px', fontSize: 13, fontWeight: t.active ? 700 : 500,
              color: t.active ? COLORS.primary : COLORS.muted,
              borderBottom: t.active ? `2px solid ${COLORS.primary}` : '2px solid transparent',
              marginBottom: -1, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            }}>
              {t.label}
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                borderRadius: 999, background: t.active ? COLORS.primary : COLORS.border,
                color: t.active ? '#fff' : COLORS.muted,
              }}>{t.count}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Urgent banner */}
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fff)',
            border: `1px solid ${COLORS.danger}33`, borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
          }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.danger + '14', color: COLORS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>1 item urgent t'attend depuis plus de 30 min</div>
              <div style={{ fontSize: 11.5, color: COLORS.muted }}>L'auteur sera notifié si tu n'y réponds pas dans l'heure.</div>
            </div>
            <button style={{
              padding: '8px 14px', borderRadius: 8, border: 'none', background: COLORS.danger, color: '#fff',
              fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: FONT,
            }}>Voir maintenant</button>
          </div>

          <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>🔴 Urgent</div>
          <PostCard
            type="QUESTION"
            author="YO" time="il y a 32 min"
            recipient={{ id: 'SO', name: 'Sonia' }}
            body={<>La cliente <b>Mme Bouazizi</b> demande à modifier sa commande de photobook (ajouter 4 pages). Elle est devant moi au comptoir. Je peux faire la modif ou je dois passer par Karim pour le devis ?</>}
            order={{ code: 'LB-202605-0036', label: 'Salma Bouazizi · photobook' }}
            urgency="CRITICAL"
            status="OPEN"
            deadline={{ label: 'Cliente attend au comptoir B1', late: true }}
            reactions={[{ emoji: '👀', n: 1 }]}
          />

          <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, marginTop: 18, textTransform: 'uppercase' }}>🟡 Aujourd'hui</div>
          <PostCard
            type="TASK"
            author="AD" time="il y a 1 h"
            recipient={{ id: 'SO', name: 'Sonia' }}
            title="Rappeler M. Trabelsi pour récupérer LB-…0040"
            body="Sa commande est prête depuis hier 16h, elle attend au comptoir et il n'a pas répondu au SMS automatique."
            order={{ code: 'LB-202605-0040', label: 'Mohamed Trabelsi · t-shirts + mugs' }}
            urgency="HIGH"
            status="OPEN"
            deadline={{ label: 'Avant lundi 12 mai', late: false }}
          />

          <PostCard
            type="HANDOFF"
            author="ME" time="il y a 2 h"
            recipient={{ id: 'SO', name: 'Sonia' }}
            body={<>Commande prête côté production. Reste à <b>encaisser 95,000 TND</b> (acompte de 90 déjà versé) avant remise au client. Lui demander de vérifier la couverture avant de partir.</>}
            order={{ code: 'LB-202605-0041', label: 'Hela Ben Romdhane · photobook A4', urgency: 'PRIORITAIRE' }}
            status="OPEN"
            reactions={[{ emoji: '👍', n: 1, mine: true }]}
          />

          <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, marginTop: 18, textTransform: 'uppercase' }}>📅 Cette semaine</div>
          <PostCard
            type="NOTE"
            author="AD" time="hier"
            recipient="Toute l'équipe"
            body="Pensez à bien remplir le champ GSM sur les pochettes papier — l'IA ne peut pas l'inventer si vous ne l'écrivez pas. C'est ce qui nous bloque pour envoyer les SMS automatiques."
            status="OPEN"
          />
        </div>
      </div>
    </div>
  );
};

window.CarnetWall = CarnetWall;
window.PourMoiScreen = PourMoiScreen;
window.PostCard = PostCard;
window.Avatar = Avatar;
window.PEOPLE = PEOPLE;
window.POST_TYPES = POST_TYPES;
window.PostIcon = PostIcon;
window.SidebarWithCarnet = SidebarWithCarnet;
