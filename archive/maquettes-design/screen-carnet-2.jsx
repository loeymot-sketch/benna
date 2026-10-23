// EL BENNA LAB OS — Carnet : Composer, Detail, Calendar, Order tab, Bell widget

// ───────── Composer (post creation modal) ─────────
const ComposerScreen = () => {
  const types = [
    { k: 'HANDOFF', ex: '"Je passe ce travail à X"' },
    { k: 'TASK', ex: '"Faire X avant Y"' },
    { k: 'QUESTION', ex: '"J\'ai besoin d\'une info"' },
    { k: 'ALERT', ex: '"Imprimante HS, stock critique"' },
    { k: 'ABSENCE_NOTE', ex: '"Je suis absent le X"' },
    { k: 'ANNOUNCEMENT', ex: '"Message à toute l\'équipe"' },
    { k: 'NOTE', ex: '"Remarque générale, info"' },
    { k: 'SHIFT_HANDOVER', ex: '"État du shift à passer"' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: 'rgba(15,23,42,0.5)',
      fontFamily: FONT, color: COLORS.text, padding: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: `linear-gradient(135deg, ${COLORS.primary}cc, ${COLORS.primaryDark}dd)`,
    }}>
      <div style={{
        width: 720, maxHeight: '95%', background: '#fff', borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5 }}>NOUVEAU POST · ÉTAPE 1/2</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 1 }}>Que veux-tu poster ?</div>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: COLORS.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={16} color={COLORS.muted} />
          </button>
        </div>
        {/* Type grid */}
        <div style={{ padding: 22, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {types.map((t, i) => {
            const def = POST_TYPES[t.k];
            const selected = i === 0;
            return (
              <div key={t.k} style={{
                padding: 14, borderRadius: 12, cursor: 'pointer',
                background: selected ? def.color + '0d' : '#fff',
                border: selected ? `2px solid ${def.color}` : `1px solid ${COLORS.border}`,
                position: 'relative',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: def.color + '14', color: def.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                }}><Icon name={def.icon} size={22} /></div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{def.emoji} {def.label}</div>
                <div style={{ fontSize: 10.5, color: COLORS.muted, lineHeight: 1.35 }}>{t.ex}</div>
                {selected && <span style={{
                  position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 999,
                  background: def.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name="check" size={11} stroke={3} /></span>}
              </div>
            );
          })}
        </div>

        {/* Form for selected type (HANDOFF) */}
        <div style={{ padding: '18px 22px', background: COLORS.bg, borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.5, marginBottom: 10 }}>
            FORMULAIRE PASSATION 🔄
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>À qui *</label>
              <div style={{ height: 38, padding: '0 12px', background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <Avatar initials="ME" color="#f97316" size={22} /> Mehdi · Production <span style={{ flex: 1 }} /> <span style={{ color: COLORS.muted, fontSize: 10 }}>▾</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Commande liée</label>
              <div style={{ height: 38, padding: '0 12px', background: '#fff', border: `1px solid ${COLORS.primary}66`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'ui-monospace,Menlo,monospace', color: COLORS.primary, fontWeight: 600 }}>
                <Icon name="list" size={13} /> LB-202605-0042 <span style={{ flex: 1 }} /> <span style={{ color: COLORS.muted, fontSize: 10 }}>▾</span>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Titre court</label>
            <div style={{ height: 38, padding: '0 12px', background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
              Maquette validée — à imprimer
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>État actuel & instructions</label>
            <div style={{ minHeight: 76, padding: 10, background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}>
              Client a validé V2 ce matin. Imprimer en 200 ex sur carton 250g, finition mate. Le PDF est en pièce jointe. Pas de coupe perdu, marges 3mm.
              <span style={{ borderLeft: `1.5px solid ${COLORS.primary}`, height: 14, display: 'inline-block', marginLeft: 1, animation: 'blink 1s infinite' }} />
            </div>
            <div style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 4 }}>💡 Astuce : tape <b>@</b> pour mentionner, <b>#</b> pour lier une commande</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Urgence</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].map(u => (
                  <div key={u} style={{
                    flex: 1, height: 32, borderRadius: 6, fontSize: 10, fontWeight: 700,
                    background: u === 'HIGH' ? URG[u].color + '14' : '#fff',
                    color: u === 'HIGH' ? URG[u].color : COLORS.muted,
                    border: `1px solid ${u === 'HIGH' ? URG[u].color : COLORS.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>{URG[u].label}</div>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Pièces jointes</label>
              <div style={{ height: 32, padding: '0 10px', background: COLORS.primary + '0d', border: `1px dashed ${COLORS.primary}66`, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.primary, fontWeight: 600, cursor: 'pointer' }}>
                <Icon name="upload" size={12} /> maquette-v2.pdf · 2,4 Mo
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, display: 'block', marginBottom: 4 }}>Effet sur la commande</label>
              <div style={{ height: 32, padding: '0 10px', background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.stProduction }} />
                <span>→ Production</span>
                <span style={{ flex: 1 }} />
                <span style={{ color: COLORS.muted, fontSize: 9 }}>auto</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${COLORS.border}`, background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT, color: COLORS.text }}>
              Aperçu
            </button>
            <button style={{ flex: 2, height: 42, borderRadius: 10, border: 'none', background: COLORS.accent, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: `0 2px 8px ${COLORS.accent}33` }}>
              Publier la passation <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────── Post Detail (with thread) ─────────
const PostDetailScreen = () => {
  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <SidebarV2 active="carnet" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="📓 Le Carnet" subtitle={<span style={{ display:'flex',gap:6,alignItems:'center' }}>Mur <Icon name="arrow" size={11} color={COLORS.muted} /> <span style={{ fontWeight: 600, color: COLORS.text }}>Passation #1287</span></span>} />
        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Original post */}
            <div style={{
              background: '#fff', border: `1px solid ${COLORS.border}`, borderLeft: `4px solid #3b82f6`,
              borderRadius: 12, padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <TypeIcon type="HANDOFF" size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: 0.4 }}>PASSATION · #1287</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 1 }}>Maquette validée — à imprimer</div>
                </div>
                <Badge color="#f59e0b" soft>● HAUTE</Badge>
                <Badge color={COLORS.success} soft>✓ pris en charge</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, marginBottom: 14 }}>
                <Avatar initials="KA" color="#a855f7" size={28} />
                <span style={{ fontWeight: 600 }}>Karim · Designer</span>
                <Icon name="arrow" size={11} color={COLORS.mutedSoft} />
                <Avatar initials="ME" color="#f97316" size={28} />
                <span style={{ fontWeight: 600 }}>Mehdi · Production</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 11.5, color: COLORS.muted }}>9 mai 2026 · 14:38</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12, color: COLORS.text }}>
                Client a validé V2 ce matin. Imprimer en <b>200 ex</b> sur carton 250g, finition mate. Le PDF est en pièce jointe. Pas de coupe perdu, marges 3mm.<br/><br/>
                <span style={{ background: COLORS.primary + '14', color: COLORS.primary, padding: '1px 4px', borderRadius: 3, fontWeight: 600 }}>@Mehdi</span> stp prio sur celle-là, livraison demain matin.
              </div>
              {/* Linked order card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: COLORS.bg, borderRadius: 10, marginBottom: 12, cursor: 'pointer' }}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: COLORS.primary + '14', color: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="list" size={18} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11.5, fontWeight: 700, color: COLORS.primary }}>LB-202605-0042</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>Abdelwahab Khelifi · 50 cartes visite carton</div>
                </div>
                <Badge color={COLORS.danger}>● URGENT</Badge>
                <StatusPill status="EN_PRODUCTION" />
                <Icon name="arrow" size={14} color={COLORS.muted} />
              </div>
              {/* Attachment */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 6, background: '#dc262614', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="file" size={16} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>maquette-v2-validee.pdf</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>2,4 Mo · 9 mai 14:38</div>
                </div>
                <button style={{ height: 28, padding: '0 10px', borderRadius: 6, border: `1px solid ${COLORS.border}`, background: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, color: COLORS.text }}>Télécharger</button>
              </div>
              {/* Reactions bar */}
              <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { e: '👍', n: 0 }, { e: '✅', n: 1, me: true }, { e: '👀', n: 2 }, { e: '❓', n: 0 }, { e: '🚨', n: 0 },
                ].filter(r => r.n > 0).map(r => (
                  <span key={r.e} style={{
                    fontSize: 12.5, padding: '4px 10px', borderRadius: 999,
                    background: r.me ? '#fef3c7' : COLORS.bg,
                    border: `1px solid ${r.me ? '#fde68a' : COLORS.border}`,
                    fontWeight: 600, cursor: 'pointer',
                  }}>{r.e} {r.n}</span>
                ))}
                <button style={{ height: 28, width: 28, borderRadius: 999, border: `1px dashed ${COLORS.borderStrong}`, background: '#fff', cursor: 'pointer', color: COLORS.muted, fontSize: 14 }}>+</button>
                <div style={{ flex: 1 }} />
                <button style={{ height: 30, padding: '0 14px', borderRadius: 8, border: 'none', background: COLORS.success, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="check" size={12} stroke={3} /> Marqué résolu par Mehdi
                </button>
              </div>
            </div>

            {/* Replies thread */}
            <div style={{ paddingLeft: 28, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 2, background: COLORS.border, borderRadius: 999 }} />
              {[
                { who: 'Mehdi', initials: 'ME', color: '#f97316',
                  body: 'Reçu, je lance dans 10 min. Le carton 250g est OK on en a en stock. ✅', time: '14:42', me: false,
                  reactions: [{ e: '👍', n: 1, me: true }] },
                { who: 'Karim', initials: 'KA', color: '#a855f7',
                  body: 'Top merci ! Penses à imprimer une épreuve avant le tirage complet stp.', time: '14:43', me: true },
                { who: 'Mehdi', initials: 'ME', color: '#f97316',
                  body: 'Yes c\'est noté. J\'ai marqué la commande comme prise en charge.', time: '14:51', me: false },
              ].map((r, i) => (
                <div key={i} style={{
                  background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10,
                  padding: 12, marginBottom: 8, position: 'relative',
                }}>
                  <div style={{ position: 'absolute', left: -28, top: 14, width: 26, height: 2, background: COLORS.border }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Avatar initials={r.initials} color={r.color} size={22} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.who}</span>
                    {r.me && <Badge color={COLORS.primary} soft style={{ fontSize: 9 }}>vous</Badge>}
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 10.5, color: COLORS.muted }}>{r.time}</span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>{r.body}</div>
                  {r.reactions && (
                    <div style={{ marginTop: 6 }}>
                      {r.reactions.map(re => (
                        <span key={re.e} style={{
                          fontSize: 11, padding: '2px 7px', borderRadius: 999,
                          background: re.me ? '#fef3c7' : COLORS.bg, border: `1px solid ${re.me ? '#fde68a' : COLORS.border}`,
                          fontWeight: 600, marginRight: 4,
                        }}>{re.e} {re.n}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Reply input */}
              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar initials="KA" color="#a855f7" size={22} />
                <div style={{ flex: 1, fontSize: 12.5, color: COLORS.mutedSoft, padding: '6px 0' }}>Répondre dans le thread… <span style={{ background: COLORS.bg, padding: '1px 5px', borderRadius: 3, color: COLORS.muted }}>@</span> mention · <span style={{ background: COLORS.bg, padding: '1px 5px', borderRadius: 3, color: COLORS.muted }}>#</span> commande</div>
                <button style={{ height: 28, width: 28, borderRadius: 8, border: 'none', background: COLORS.primary, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="arrow" size={14} stroke={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: receipts + info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>👁️ Accusés de lecture</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar initials="ME" color="#f97316" size={24} />
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <div style={{ fontWeight: 600 }}>Mehdi</div>
                    <div style={{ fontSize: 10.5, color: COLORS.muted }}>vu à 14:41 · répondu à 14:42</div>
                  </div>
                  <Icon name="check" size={14} color={COLORS.success} stroke={3} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar initials="AD" color="linear-gradient(135deg,#f59e0b,#dc2626)" size={24} />
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <div style={{ fontWeight: 600 }}>Adel <span style={{ fontSize: 10, color: COLORS.muted, fontWeight: 500 }}>(observateur)</span></div>
                    <div style={{ fontSize: 10.5, color: COLORS.muted }}>vu à 15:02</div>
                  </div>
                  <Icon name="check" size={14} color={COLORS.success} stroke={3} />
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>ℹ️ Informations</div>
              {[
                { l: 'Type', v: '🔄 Passation' },
                { l: 'Visibilité', v: 'Direct · Mehdi' },
                { l: 'Boutique', v: 'B1 · Bourguiba' },
                { l: 'Créé', v: '9 mai 14:38' },
                { l: 'Résolu par', v: 'Mehdi · 14:51' },
                { l: 'Effet auto', v: '→ Production', tag: true },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 11.5, borderBottom: i < 5 ? `1px solid ${COLORS.border}` : 'none' }}>
                  <span style={{ color: COLORS.muted }}>{m.l}</span>
                  <span style={{ fontWeight: 600, color: m.tag ? COLORS.stProduction : COLORS.text }}>{m.v}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>⚡ Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                {['📌 Épingler', '🔗 Copier le lien', '📤 Exporter PDF (litiges)', '🔄 Réouvrir', '🗄️ Archiver'].map(a => (
                  <div key={a} style={{ padding: '6px 8px', borderRadius: 6, cursor: 'pointer', color: COLORS.text }}>{a}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────── Absences calendar ─────────
const AbsencesCalendar = () => {
  const days = Array.from({ length: 35 }, (_, i) => i - 3);
  const today = 9;
  const absences = [
    { user: 'Mohamed', col: '#0ea5e9', start: 12, end: 13, sub: 'Ali' },
    { user: 'Salma', col: '#ec4899', start: 9, end: 9, sub: 'Yosra' },
    { user: 'Salem', col: '#f97316', start: 18, end: 18, sub: 'Ahmed' },
    { user: 'Karim', col: '#a855f7', start: 22, end: 25, sub: 'Imen' },
  ];
  const dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <SidebarV2 active="absences" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="🌴 Calendrier des absences" subtitle="Mai 2026 · 4 absences planifiées" right={
          <button style={{ height: 38, padding: '0 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT, color: COLORS.text, display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
            <Icon name="plus" size={14} /> Déclarer absence
          </button>
        } />
        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
          <div>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="arrow" size={14} color={COLORS.muted} />
              </button>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Mai 2026</div>
              <button style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scaleX(-1)' }}>
                <Icon name="arrow" size={14} color={COLORS.muted} />
              </button>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 2, padding: 2, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
                {['Jour', 'Semaine', 'Mois'].map((v, i) => (
                  <div key={v} style={{ padding: '5px 12px', fontSize: 11.5, fontWeight: 600, borderRadius: 6, background: i === 2 ? COLORS.primary : 'transparent', color: i === 2 ? '#fff' : COLORS.muted, cursor: 'pointer' }}>{v}</div>
                ))}
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {dayNames.map(d => (
                <div key={d} style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, textAlign: 'center', padding: '6px 0' }}>{d.toUpperCase()}</div>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {days.map((d, i) => {
                const isToday = d === today;
                const inMonth = d > 0 && d <= 31;
                const dayAbs = absences.filter(a => d >= a.start && d <= a.end);
                return (
                  <div key={i} style={{
                    aspectRatio: '1.2', background: '#fff',
                    border: `1px solid ${isToday ? COLORS.primary : COLORS.border}`,
                    borderRadius: 8, padding: 6,
                    opacity: inMonth ? 1 : 0.4,
                    boxShadow: isToday ? `0 0 0 2px ${COLORS.primary}33` : 'none',
                    display: 'flex', flexDirection: 'column', gap: 3, position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 600, color: isToday ? COLORS.primary : COLORS.text }}>
                      {inMonth ? d : (d > 0 ? d : 30 + d)}
                    </div>
                    {dayAbs.map((a, j) => (
                      <div key={j} style={{
                        background: a.col, color: '#fff',
                        fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{a.user}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.warning, marginBottom: 8, letterSpacing: 0.4 }}>● EN COURS — 9 MAI</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar initials="SA" color="#ec4899" size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Salma · Réception</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>RDV médical · journée · → Yosra</div>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: COLORS.text, padding: 10, background: COLORS.bg, borderRadius: 8, lineHeight: 1.5 }}>
                "Yosra, j'ai laissé les commandes urgentes du jour sur le tableau, et le rappel pour M. Trabelsi à faire après 14h. Merci !"
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 10, letterSpacing: 0.4 }}>À VENIR</div>
              {[
                { who: 'Mohamed', t: 'Imprimeur', col: '#0ea5e9', when: '12 → 13 mai', d: '2 j', sub: 'Ali', type: 'CONGE' },
                { who: 'Salem', t: 'Imprimeur', col: '#f97316', when: '18 mai', d: '1 j', sub: 'Ahmed', type: 'FORMATION' },
                { who: 'Karim', t: 'Designer', col: '#a855f7', when: '22 → 25 mai', d: '4 j', sub: 'Imen', type: 'CONGE' },
              ].map((a, i) => (
                <div key={i} style={{ padding: '8px 0', borderTop: i ? `1px solid ${COLORS.border}` : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar initials={a.who.slice(0, 2).toUpperCase()} color={a.col} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.who} <span style={{ color: COLORS.muted, fontSize: 10.5, fontWeight: 500 }}>· {a.t}</span></div>
                    <div style={{ fontSize: 10.5, color: COLORS.muted }}>{a.when} · → {a.sub}</div>
                  </div>
                  <Badge color={a.type === 'CONGE' ? '#14b8a6' : '#a855f7'} soft style={{ fontSize: 9 }}>{a.type}</Badge>
                </div>
              ))}
            </div>

            <div style={{ background: 'linear-gradient(135deg,#fef9c3,#fef3c7)', border: '1px solid #fde68a', borderRadius: 12, padding: 14, fontSize: 12, color: '#854d0e', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>💡 Astuce</div>
              Quand tu assignes une commande à un membre absent, le système te propose automatiquement son remplaçant.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────── Order tab : Carnet ─────────
const OrderCarnetTab = () => {
  const posts = [
    { type: 'NOTE', author: { name: 'Sonia', initials: 'SO', color: '#3b82f6' }, recipient: 'à elle-même',
      body: "Client réticent sur le prix au début, j'ai accordé 5% de remise. À voir avec Adel pour valider.",
      time: 'créée · 14:22', urgency: 'NORMAL', status: 'OPEN', replies: 0 },
    { type: 'HANDOFF', author: { name: 'Sonia', initials: 'SO', color: '#3b82f6' }, recipient: 'Karim · Designer',
      body: "Nouvelle commande URGENTE, le client veut récupérer aujourd'hui à 17h. Cf. pochette scannée pour la description.",
      time: '14:25', urgency: 'CRITICAL', status: 'RESOLVED', replies: 1,
      reactions: [{ e: '✅', n: 1 }] },
    { type: 'QUESTION', author: { name: 'Karim', initials: 'KA', color: '#a855f7' }, recipient: 'Sonia',
      body: "@Sonia tu as son numéro ? La pochette dit pas de GSM. J'ai besoin de vérifier la couleur du logo qu'il veut.",
      time: '15:10', urgency: 'HIGH', status: 'RESOLVED', replies: 2,
      reactions: [{ e: '✅', n: 1 }] },
    { type: 'HANDOFF', author: { name: 'Karim', initials: 'KA', color: '#a855f7' }, recipient: 'Mehdi · Production',
      title: 'Maquette validée — à imprimer',
      body: 'Client a validé V2, imprimer 200 ex carton 250g, finition mate. PDF en pièce jointe.',
      time: '14:38', urgency: 'HIGH', status: 'OPEN', replies: 3,
      reactions: [{ e: '✅', n: 1 }, { e: '👀', n: 2 }] },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <SidebarV2 active="orders" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="Commande LB-202605-0042" subtitle="Onglet : Carnet — communication interne liée à cette commande" />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Order summary */}
          <div style={{
            background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12,
            padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ width: 44, height: 44, borderRadius: 10, background: COLORS.danger + '14', color: COLORS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="fire" size={22} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 600, color: COLORS.muted }}>LB-202605-0042 · Pochette #0061340</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Abdelwahab Khelifi · 50 cartes visite carton</div>
            </div>
            <Badge color={COLORS.danger}>● URGENT</Badge>
            <StatusPill status="EN_PRODUCTION" />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 18 }}>
            {['Vue d\'ensemble', 'Description', 'Pièces jointes', 'Historique', 'Carnet (4)', 'Paiements'].map((t, i) => (
              <div key={t} style={{
                padding: '10px 14px', fontSize: 12.5, fontWeight: i === 4 ? 700 : 500,
                color: i === 4 ? COLORS.primary : COLORS.muted,
                borderBottom: i === 4 ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                marginBottom: -1, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>{t}</div>
            ))}
          </div>

          {/* Quick post bar */}
          <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, padding: '0 6px' }}>POST RAPIDE :</span>
            {Object.entries(POST_TYPES).slice(0, 6).map(([k, v]) => (
              <button key={k} style={{
                height: 28, padding: '0 10px', borderRadius: 6,
                border: `1px solid ${v.color}33`, background: v.color + '0d',
                color: v.color, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', gap: 4,
              }}><Icon name={v.icon} size={12} /> {v.label}</button>
            ))}
          </div>

          {/* Mini-feed */}
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 6, top: 8, bottom: 8, width: 2, background: COLORS.border, borderRadius: 999 }} />
            {posts.map((p, i) => (
              <div key={i} style={{ marginBottom: 10, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: -22, top: 14, width: 14, height: 14, borderRadius: 999,
                  background: '#fff', border: `2px solid ${POST_TYPES[p.type].color}`,
                }} />
                <PostCard post={p} compact />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────── Notification bell widget (zoomed) ─────────
const BellWidget = () => {
  return (
    <div style={{
      width: '100%', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text,
      padding: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 14, fontWeight: 600, letterSpacing: 0.4 }}>
          WIDGET CLOCHE — APERÇU AU SURVOL
        </div>

        {/* Topbar mockup */}
        <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 10, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <Logo size={26} withText={false} />
          <div style={{ flex: 1, height: 32, padding: '0 10px', background: COLORS.bg, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.muted }}>
            <Icon name="search" size={13} /> Rechercher...
          </div>
          <div style={{ position: 'relative' }}>
            <button style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${COLORS.accent}`, background: COLORS.accent + '0d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Icon name="bell" size={18} color={COLORS.accent} />
              <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 999, background: COLORS.accent, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', padding: '0 5px' }}>3</span>
            </button>
            {/* Arrow connector */}
            <div style={{ position: 'absolute', top: '100%', right: 12, width: 16, height: 16, background: '#fff', border: `1px solid ${COLORS.border}`, borderBottom: 'none', borderRight: 'none', transform: 'translateY(8px) rotate(45deg)', zIndex: 2 }} />
          </div>
          <Avatar initials="KA" color="#a855f7" size={32} />
        </div>

        {/* Popover */}
        <div style={{
          background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12,
          boxShadow: '0 12px 40px rgba(15,23,42,0.15)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(180deg, #fff, #fafafa)' }}>
            <Icon name="bell" size={16} color={COLORS.accent} />
            <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>Pour Moi · Karim</span>
            <Badge color={COLORS.danger}>3 nouveaux</Badge>
          </div>
          {[
            { type: 'HANDOFF', who: 'Sonia', time: 'il y a 15 min', t: 'Maquette faire-part Studio Maya', sub: 'À finaliser pour 12h', urg: 'CRITICAL', new: true },
            { type: 'TASK', who: 'Adel', time: 'il y a 1 h', t: 'Refaire logo Resto Dar Yassmine V3', sub: 'Deadline mer. 13 mai', urg: 'HIGH', new: true },
            { type: 'QUESTION', who: 'Yosra', time: 'il y a 4 h', t: '@Karim peux-tu confirmer fond transparent ?', sub: 'LB-…0033', urg: 'NORMAL', new: true },
            { type: 'NOTE', who: 'Sys.', time: 'hier', t: 'Stock papier 250g critique', sub: '8 feuilles restantes', urg: 'NORMAL', new: false },
            { type: 'HANDOFF', who: 'Sonia', time: 'hier', t: 'Yosra a pris en charge ton item', sub: 'LB-…0040 — finalisé', urg: 'NORMAL', new: false },
          ].map((n, i) => {
            const def = POST_TYPES[n.type];
            return (
              <div key={i} style={{
                padding: '11px 16px', display: 'flex', alignItems: 'flex-start', gap: 10,
                borderBottom: i < 4 ? `1px solid ${COLORS.border}` : 'none',
                background: n.new ? '#fefefa' : '#fff', cursor: 'pointer',
                position: 'relative',
              }}>
                {n.new && <span style={{ position: 'absolute', left: 6, top: 18, width: 6, height: 6, borderRadius: 999, background: COLORS.accent }} />}
                <TypeIcon type={n.type} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: def.color, letterSpacing: 0.3 }}>{def.label.toUpperCase()}</span>
                    <span style={{ fontSize: 10, color: COLORS.muted }}>· {n.who}</span>
                    {n.urg === 'CRITICAL' && <Badge color={COLORS.danger} soft style={{ fontSize: 9 }}>● URGENT</Badge>}
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 10, color: COLORS.mutedSoft }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 1 }}>{n.t}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{n.sub}</div>
                </div>
              </div>
            );
          })}
          <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: `1px solid ${COLORS.border}`, fontSize: 12, fontWeight: 700, color: COLORS.primary, cursor: 'pointer', background: '#fafafa' }}>
            Voir tout dans Pour Moi →
          </div>
        </div>
      </div>
    </div>
  );
};

window.ComposerScreen = ComposerScreen;
window.PostDetailScreen = PostDetailScreen;
window.AbsencesCalendar = AbsencesCalendar;
window.OrderCarnetTab = OrderCarnetTab;
window.BellWidget = BellWidget;
