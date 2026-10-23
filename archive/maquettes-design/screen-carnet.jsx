// EL BENNA LAB OS — Le Carnet (Team Hub)

const POST_TYPES = {
  HANDOFF:        { label: 'Passation',     icon: 'arrow',    color: '#3b82f6', emoji: '🔄' },
  TASK:           { label: 'Tâche',         icon: 'check',    color: '#f59e0b', emoji: '✅' },
  ABSENCE_NOTE:   { label: 'Absence',       icon: 'calendar', color: '#14b8a6', emoji: '🌴' },
  QUESTION:       { label: 'Question',      icon: 'msg',      color: '#8b5cf6', emoji: '❓' },
  ANNOUNCEMENT:   { label: 'Annonce',       icon: 'bell',     color: '#dc2626', emoji: '📢' },
  ALERT:          { label: 'Alerte',        icon: 'fire',     color: '#ea580c', emoji: '⚠️' },
  NOTE:           { label: 'Note',          icon: 'edit',     color: '#64748b', emoji: '📝' },
  SHIFT_HANDOVER: { label: 'Passation shift', icon: 'clock',  color: '#7c3aed', emoji: '🗓️' },
};

const URG = {
  LOW:      { label: 'Basse',    color: '#94a3b8' },
  NORMAL:   { label: 'Normal',   color: '#3b82f6' },
  HIGH:     { label: 'Haute',    color: '#f59e0b' },
  CRITICAL: { label: 'Critique', color: '#dc2626' },
};

const Avatar = ({ initials, color, size = 28, ring }) => (
  <div style={{
    width: size, height: size, borderRadius: 999, background: color,
    color: '#fff', fontWeight: 700, fontSize: size * 0.36,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    flex: '0 0 auto', boxShadow: ring ? `0 0 0 2px ${ring}` : 'none',
    border: '2px solid #fff',
  }}>{initials}</div>
);

const TypeIcon = ({ type, size = 28 }) => {
  const t = POST_TYPES[type];
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flex: '0 0 auto',
      background: t.color + '14', color: t.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}><Icon name={t.icon} size={size * 0.55} stroke={2.2} /></div>
  );
};

const PostCard = ({ post, compact = false }) => {
  const t = POST_TYPES[post.type];
  const u = URG[post.urgency || 'NORMAL'];
  return (
    <div style={{
      background: '#fff', border: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${t.color}`, borderRadius: 10,
      padding: compact ? 11 : 13, position: 'relative',
      boxShadow: post.urgency === 'CRITICAL' ? `0 0 0 1px ${u.color}33, 0 4px 14px ${u.color}1a` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <TypeIcon type={post.type} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.color, letterSpacing: 0.4, textTransform: 'uppercase' }}>{t.label}</span>
            {post.urgency && post.urgency !== 'NORMAL' && (
              <span style={{
                fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                background: u.color + '14', color: u.color,
              }}>● {post.urgency}</span>
            )}
            {post.pinned && <Badge color="#dc2626" soft style={{ fontSize: 9.5 }}>📌 épinglé</Badge>}
            {post.status === 'RESOLVED' && <Badge color={COLORS.success} soft style={{ fontSize: 9.5 }}>✓ résolu</Badge>}
            {post.status === 'OPEN' && <span style={{ width: 6, height: 6, borderRadius: 999, background: '#3b82f6' }} />}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 10.5, color: COLORS.muted }}>{post.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
            <Avatar initials={post.author.initials} color={post.author.color} size={20} />
            <span style={{ fontWeight: 600 }}>{post.author.name}</span>
            <Icon name="arrow" size={11} color={COLORS.mutedSoft} />
            <span style={{ color: COLORS.muted }}>{post.recipient}</span>
          </div>
          {post.title && <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>{post.title}</div>}
          <div style={{ fontSize: 12.5, color: COLORS.text, lineHeight: 1.45,
            display: '-webkit-box', WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.body}
          </div>
          {/* footer chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {post.order && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                background: COLORS.primary + '0d', color: COLORS.primary,
                border: `1px solid ${COLORS.primary}22`, fontFamily: 'ui-monospace,Menlo,monospace',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}><Icon name="list" size={11} /> {post.order}</span>
            )}
            {post.deadline && (
              <span style={{ fontSize: 11, color: COLORS.muted, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="clock" size={11} /> {post.deadline}
              </span>
            )}
            {post.attachments && (
              <span style={{ fontSize: 11, color: COLORS.muted, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="file" size={11} /> {post.attachments}
              </span>
            )}
            <div style={{ flex: 1 }} />
            {post.reactions && post.reactions.map(r => (
              <span key={r.e} style={{
                fontSize: 11, padding: '2px 7px', borderRadius: 999,
                background: r.me ? '#fef3c7' : COLORS.bg, border: `1px solid ${r.me ? '#fde68a' : COLORS.border}`,
                fontWeight: 600, color: COLORS.text,
              }}>{r.e} {r.n}</span>
            ))}
            {post.replies > 0 && (
              <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>
                💬 {post.replies}
              </span>
            )}
            {post.receipts && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: COLORS.muted }}>
                <span>vu</span>
                {post.receipts.map((r, i) => (
                  <span key={i} title={r.who} style={{
                    width: 16, height: 16, borderRadius: 999, background: r.color,
                    color: '#fff', fontWeight: 700, fontSize: 8,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid #fff', marginLeft: i > 0 ? -5 : 0,
                  }}>{r.i}</span>
                ))}
                <span style={{ marginLeft: 3 }}>{post.receipts.length}/{post.recipientCount || post.receipts.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────── Carnet wall (Mur) ─────────
const CarnetWall = () => {
  const sample = [
    { type: 'HANDOFF', author: { name: 'Ahmed', initials: 'KA', color: '#a855f7' }, recipient: 'Salem · imprimeur',
      title: 'Maquette validée — à imprimer',
      body: 'Client a validé V2 ce matin. Imprimer en 200 ex sur carton 250g, finition mate. Le PDF est en pièce jointe. Pas de coupe perdu, marges 3mm.',
      order: 'LB-202605-0042', time: 'il y a 3 min', urgency: 'HIGH', status: 'OPEN',
      attachments: 'maquette-v2.pdf', replies: 0,
      reactions: [{ e: '👀', n: 1, me: false }],
      receipts: [{ i: 'M', color: '#f97316', who: 'Mehdi' }], recipientCount: 1 },
    { type: 'QUESTION', author: { name: 'Yosra', initials: 'YO', color: '#14b8a6' }, recipient: 'Tous · Réception',
      title: 'Tarif sublimation casquette ?',
      body: "Une cliente demande pour 12 casquettes brodées avec son logo de salon de coiffure. Je vois pas le prix dans le catalogue, qui peut me donner le tarif unité svp ?",
      time: 'il y a 12 min', urgency: 'NORMAL', status: 'OPEN',
      replies: 2, reactions: [{ e: '👀', n: 3, me: true }] },
    { type: 'ALERT', author: { name: 'Mehdi', initials: 'ME', color: '#f97316' }, recipient: 'Tous · Production',
      title: 'Imprimante grand format — bourrage récurrent',
      body: 'Depuis ce matin la HP T520 fait 2-3 bourrages par bobine. J\'ai nettoyé les rouleaux mais le souci revient. Je suspecte le rouleau d\'entraînement. À surveiller, on peut tenir la journée mais à voir avec le SAV demain.',
      time: 'il y a 28 min', urgency: 'HIGH', status: 'OPEN',
      reactions: [{ e: '👀', n: 4 }, { e: '🚨', n: 1 }], replies: 1 },
    { type: 'TASK', author: { name: 'Adel', initials: 'AD', color: 'linear-gradient(135deg,#f59e0b,#dc2626)' }, recipient: 'Karim · Designer',
      title: 'Refaire logo Resto Dar Yassmine',
      body: 'Le client a renvoyé ses photos finales pour la charte. À intégrer dans la V3 du logo + carte avant mercredi 18h.',
      order: 'LB-202605-0037', time: 'il y a 1 h', urgency: 'NORMAL', status: 'OPEN',
      deadline: 'Mer. 13 mai — 18h00', replies: 0 },
    { type: 'NOTE', author: { name: 'Sonia', initials: 'SO', color: '#3b82f6' }, recipient: 'Tous',
      body: "M. Khelifi (LB-…0042) a précisé qu'il préfère qu'on l'appelle avant 16h, pas après. À noter pour la suite.",
      order: 'LB-202605-0042', time: 'il y a 2 h', urgency: 'LOW', status: 'SEEN',
      reactions: [{ e: '👍', n: 2 }], replies: 0 },
    { type: 'HANDOFF', author: { name: 'Karim', initials: 'KA', color: '#a855f7' }, recipient: 'Mehdi · Production',
      title: 'École Al Amal — fichiers prêts',
      body: '24 t-shirts à sublimer. Logo en PDF haute déf, tailles séparées. Couleurs : 12 bleu marine, 12 rouge.',
      order: 'LB-202605-0036', time: 'hier 17h22', urgency: 'NORMAL', status: 'RESOLVED',
      reactions: [{ e: '✅', n: 1 }] },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <SidebarV2 active="carnet" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="📓 Le Carnet — communication équipe" subtitle="6 nouveaux items · 2 alertes ouvertes · 1 absence en cours" right={
          <button style={{
            height: 38, padding: '0 14px', borderRadius: 8, border: 'none',
            background: COLORS.accent, color: '#fff', fontWeight: 700, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: FONT,
            boxShadow: `0 2px 6px ${COLORS.accent}33`,
          }}><Icon name="plus" size={15} /> Nouveau post</button>
        } />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
            {/* Main feed */}
            <div>
              {/* Pinned annonces */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📌 ÉPINGLÉS
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7, #fef9c3)',
                  border: `1px solid #fde68a`, borderRadius: 10, padding: 14,
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <TypeIcon type="ANNOUNCEMENT" size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: 0.4, marginBottom: 2 }}>ANNONCE · Adel · Admin</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#854d0e', marginBottom: 3 }}>Réunion équipe samedi 16 mai à 10h</div>
                    <div style={{ fontSize: 12, color: '#854d0e', lineHeight: 1.4 }}>Bilan du mois + nouveaux tarifs sublimation. Présence obligatoire pour les responsables shift. Café offert.</div>
                  </div>
                  <span style={{ fontSize: 10.5, color: '#854d0e', fontWeight: 600, opacity: 0.7 }}>visible 7j</span>
                </div>
              </div>

              {/* Feed */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginRight: 6 }}>FLUX RÉCENT</div>
                {[
                  { l: 'Tous', active: true, n: 42 },
                  { l: 'À moi', n: 5 },
                  { l: 'Ma boutique' },
                  { l: 'Tâches', n: 8 },
                  { l: 'Passations' },
                  { l: 'Alertes', n: 2, hot: true },
                  { l: 'Non lus', n: 3 },
                ].map(f => (
                  <div key={f.l} style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                    background: f.active ? COLORS.primary : '#fff',
                    color: f.active ? '#fff' : (f.hot ? COLORS.danger : COLORS.text),
                    border: `1px solid ${f.active ? COLORS.primary : (f.hot ? COLORS.danger + '44' : COLORS.border)}`,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>{f.l} {f.n != null && <span style={{
                    background: f.active ? 'rgba(255,255,255,.25)' : (f.hot ? COLORS.danger : COLORS.bg),
                    color: f.active ? '#fff' : (f.hot ? '#fff' : COLORS.muted),
                    padding: '0 5px', borderRadius: 999, fontSize: 9.5, fontWeight: 700,
                  }}>{f.n}</span>}</div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sample.map((p, i) => <PostCard key={i} post={p} />)}
              </div>
            </div>

            {/* Right rail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Absences */}
              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>🌴 Absences</span>
                  <span style={{ fontSize: 11, color: COLORS.muted }}>2 en cours · 1 à venir</span>
                </div>
                {[
                  { who: 'Mohamed · Imprimeur', init: 'MO', col: '#0ea5e9', when: '12 → 13 mai', sub: 'Ali (remplaçant)', current: true },
                  { who: 'Salma · Réception', init: 'SA', col: '#ec4899', when: 'aujourd\'hui', sub: 'Yosra', current: true },
                  { who: 'Salem · Imprimeur', init: 'SE', col: '#f97316', when: '18 mai · formation', sub: 'Ahmed', current: false },
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i ? `1px solid ${COLORS.border}` : 'none' }}>
                    <Avatar initials={a.init} color={a.col} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{a.who}</div>
                      <div style={{ fontSize: 10.5, color: COLORS.muted }}>{a.when} · → {a.sub}</div>
                    </div>
                    {a.current && <span style={{ width: 7, height: 7, borderRadius: 999, background: COLORS.warning }} />}
                  </div>
                ))}
                <div style={{ marginTop: 10, fontSize: 11.5, color: COLORS.primary, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Voir le calendrier <Icon name="arrow" size={11} />
                </div>
              </div>

              {/* Alerts */}
              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>⚠️ Alertes ouvertes</span>
                  <Badge color={COLORS.danger} soft>2</Badge>
                </div>
                {[
                  { t: 'HP T520 — bourrages récurrents', who: 'Mehdi', sev: 'HIGH', age: '28 min' },
                  { t: 'Stock papier 250g — 8 feuilles', who: 'Sys.', sev: 'NORMAL', age: '4 h' },
                ].map((a, i) => (
                  <div key={i} style={{ padding: '8px 0', borderTop: i ? `1px solid ${COLORS.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: a.sev === 'HIGH' ? COLORS.danger : COLORS.warning }} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{a.t}</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: COLORS.muted, paddingLeft: 12 }}>par {a.who} · il y a {a.age}</div>
                  </div>
                ))}
              </div>

              {/* Team online */}
              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🟢 Équipe en ligne</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { i: 'AD', c: 'linear-gradient(135deg,#f59e0b,#dc2626)', on: true },
                    { i: 'SO', c: '#3b82f6', on: true },
                    { i: 'KA', c: '#a855f7', on: true },
                    { i: 'ME', c: '#f97316', on: true },
                    { i: 'YO', c: '#14b8a6', on: false },
                    { i: 'NI', c: '#16a34a', on: true },
                    { i: 'AL', c: '#0ea5e9', on: false },
                  ].map((m, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <Avatar initials={m.i} color={m.c} size={32} />
                      <span style={{
                        position: 'absolute', bottom: 0, right: 0, width: 9, height: 9,
                        borderRadius: 999, background: m.on ? COLORS.success : COLORS.mutedSoft,
                        border: '2px solid #fff',
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar V2 with Carnet entry
const SidebarV2 = ({ active = 'carnet' }) => {
  const items = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'home' },
    { id: 'kanban', label: 'Kanban', icon: 'kanban' },
    { id: 'orders', label: 'Commandes', icon: 'list', count: 47 },
    { id: 'carnet', label: 'Le Carnet', icon: 'file', count: 6, badge: true },
    { id: 'pourmoi', label: 'Pour moi', icon: 'bell', count: 5, hot: true },
    { id: 'absences', label: 'Absences', icon: 'calendar' },
    { id: 'scan', label: 'Scanner pochette', icon: 'scan' },
    { id: 'customers', label: 'Clients', icon: 'users' },
    { id: 'studio', label: 'Studio', icon: 'cam' },
    { id: 'cash', label: 'Caisse', icon: 'cash' },
    { id: 'stats', label: 'Statistiques', icon: 'chart' },
  ];
  return (
    <aside style={{ width: 240, background: COLORS.panel, borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', flex: '0 0 240px' }}>
      <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${COLORS.border}` }}><Logo /></div>
      <nav style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {items.map(it => {
          const isActive = it.id === active;
          return (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? COLORS.primary : COLORS.text,
              background: isActive ? COLORS.primary + '14' : 'transparent',
              cursor: 'pointer',
            }}>
              <Icon name={it.icon} size={17} />
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.count != null && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                  background: it.hot ? COLORS.danger : (isActive ? COLORS.primary : COLORS.border),
                  color: it.hot || isActive ? '#fff' : COLORS.muted,
                }}>{it.count}</span>
              )}
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '9px 10px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: COLORS.muted, cursor: 'pointer' }}>
          <Icon name="settings" size={17} /> <span>Paramètres</span>
        </div>
      </nav>
      <div style={{ padding: 12, borderTop: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials="SO" color="linear-gradient(135deg,#3b82f6,#1e3a8a)" size={34} />
        <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>Sonia · Réception</div>
          <div style={{ fontSize: 11, color: COLORS.muted }}>Boutique 1</div>
        </div>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.success }} />
      </div>
    </aside>
  );
};

// ───────── Pour Moi (Inbox) ─────────
const PourMoiScreen = () => {
  const items = [
    { type: 'TASK', author: { name: 'Adel', initials: 'AD', color: 'linear-gradient(135deg,#f59e0b,#dc2626)' }, recipient: 'moi',
      title: 'Refaire logo Resto Dar Yassmine V3', body: 'Le client a renvoyé ses photos finales. À intégrer avant mercredi 18h.',
      order: 'LB-202605-0037', time: 'il y a 1 h', urgency: 'HIGH', status: 'OPEN',
      deadline: 'Mer. 13 mai — 18h00', overdue: false },
    { type: 'HANDOFF', author: { name: 'Sonia', initials: 'SO', color: '#3b82f6' }, recipient: 'moi',
      title: 'Maquette faire-part Studio Maya — à finaliser', body: 'Cliente passée ce matin, voici les corrections demandées : changer la police du prénom, recentrer la photo, et passer le fond en ivoire.',
      order: 'LB-202605-0039', time: 'il y a 2 h', urgency: 'CRITICAL', status: 'OPEN',
      deadline: "Auj. 12h00 — DANS 2h !", overdue: false },
    { type: 'QUESTION', author: { name: 'Yosra', initials: 'YO', color: '#14b8a6' }, recipient: 'Designers',
      body: 'Ahmed, peux-tu me confirmer si on peut faire un logo sur fond transparent pour la commande LB-…0033 ? Merci !',
      time: 'il y a 4 h', urgency: 'NORMAL', status: 'OPEN', mention: true },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <SidebarV2 active="pourmoi" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="📥 Pour Moi · Karim" subtitle="3 items à traiter — dont 1 critique 🔴" />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 18 }}>
            {[
              { l: 'À traiter', n: 3, active: true, hot: true },
              { l: 'À suivre', n: 4 },
              { l: 'Vu / Archive', n: 28 },
            ].map(t => (
              <div key={t.l} style={{
                padding: '10px 16px', fontSize: 13, fontWeight: t.active ? 700 : 500,
                color: t.active ? COLORS.primary : COLORS.muted,
                borderBottom: t.active ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                marginBottom: -1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {t.l} <span style={{
                  background: t.hot ? COLORS.danger : (t.active ? COLORS.primary : COLORS.border),
                  color: t.hot || t.active ? '#fff' : COLORS.muted,
                  padding: '0 6px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                }}>{t.n}</span>
              </div>
            ))}
          </div>

          {/* Section: critical */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.danger, letterSpacing: 0.4, marginBottom: 8 }}>● CRITIQUE — ACTION SOUS 2H</div>
            <PostCard post={items[1]} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingLeft: 4 }}>
              <button style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: COLORS.success, color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="check" size={13} /> Je prends ✓
              </button>
              <button style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT, color: COLORS.text, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="msg" size={13} /> Répondre
              </button>
              <button style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT, color: COLORS.muted }}>
                Reporter
              </button>
              <button style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT, color: COLORS.muted }}>
                Déléguer →
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginBottom: 8 }}>AUTRES ITEMS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PostCard post={items[0]} />
              <PostCard post={items[2]} />
            </div>
          </div>

          <div style={{ padding: 16, background: COLORS.panel, border: `1px dashed ${COLORS.border}`, borderRadius: 10, textAlign: 'center', fontSize: 12.5, color: COLORS.muted }}>
            🎉 C'est tout ! Vous êtes à jour.
          </div>
        </div>
      </div>
    </div>
  );
};

window.POST_TYPES = POST_TYPES;
window.PostCard = PostCard;
window.SidebarV2 = SidebarV2;
window.CarnetWall = CarnetWall;
window.PourMoiScreen = PourMoiScreen;
window.Avatar = Avatar;
window.TypeIcon = TypeIcon;
