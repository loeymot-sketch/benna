// EL BENNA LAB OS — Order Detail + Public Tracking + Mobile

// ───────────────────────── Order Detail ─────────────────────────
const OrderDetailScreen = () => {
  const timeline = [
    { st: 'RECUE', label: 'Reçue', who: 'Sonia · Réception', t: '9 mai 14:22', done: true },
    { st: 'EN_COURS_DESIGN', label: 'En cours · Design', who: 'Karim', t: '9 mai 14:35', done: true, current: true },
    { st: 'VALIDATION_CLIENT', label: 'Validation client', who: 'En attente — SMS envoyé', t: '—', done: false },
    { st: 'EN_PRODUCTION', label: 'Production · Impression', who: '—', t: '—', done: false },
    { st: 'PRETE', label: 'Prête', who: '—', t: '—', done: false },
    { st: 'LIVREE', label: 'Livrée', who: '—', t: '—', done: false },
  ];

  const StatusMap = {
    RECUE: COLORS.stRecue, EN_COURS_DESIGN: COLORS.stEnCours, VALIDATION_CLIENT: COLORS.stValidation,
    EN_PRODUCTION: COLORS.stProduction, PRETE: COLORS.stPrete, LIVREE: COLORS.stLivree,
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <Sidebar active="orders" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="Commandes" subtitle={<span style={{ display:'flex',gap:8,alignItems:'center' }}><span>Liste</span> <Icon name="arrow" size={11} color={COLORS.muted} /> <span style={{ color: COLORS.text, fontWeight: 600 }}>LB-202605-0042</span></span>} />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Header card */}
          <div style={{
            background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 14,
            padding: 20, marginBottom: 16,
            background: `linear-gradient(135deg, #fff 0%, #fff 60%, ${COLORS.danger}08 100%)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: COLORS.danger + '14', color: COLORS.danger,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flex: '0 0 auto',
              }}><Icon name="fire" size={26} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>LB-202605-0042</span>
                  <span style={{ fontSize: 11, color: COLORS.mutedSoft }}>·</span>
                  <span style={{ fontSize: 11.5, color: COLORS.muted }}>Pochette papier <b style={{ color: COLORS.text }}>#0061340</b></span>
                  <Badge color={COLORS.danger}>● URGENT</Badge>
                  <StatusPill status="EN_COURS_DESIGN" />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>Abdelwahab Khelifi</div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span><Icon name="phone" size={12} /> +216 22 145 332</span>
                  <span>Client depuis mars 2024 · 7 commandes</span>
                  <span style={{ color: COLORS.danger, fontWeight: 600 }}>● À livrer aujourd'hui 17:00 — dans 2h 38min</span>
                </div>
              </div>
              <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>12,000 <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500 }}>TND</span></div>
                <div style={{ fontSize: 12, color: COLORS.warning, fontWeight: 600 }}>● Reste 12,000 TND à encaisser</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button style={{ height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5, color: COLORS.text }}>
                    <Icon name="print" size={13} /> Reçu
                  </button>
                  <button style={{ height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5, color: COLORS.text }}>
                    <Icon name="msg" size={13} /> SMS client
                  </button>
                  <button style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: COLORS.success, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="check" size={13} /> Marquer prête
                  </button>
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginTop: 18, borderBottom: `1px solid ${COLORS.border}`, marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20, marginBottom: -20 }}>
              {['Vue d\'ensemble', 'Description & lignes', 'Pièces jointes (3)', 'Historique', 'Paiements', 'Communication'].map((t, i) => (
                <div key={t} style={{
                  padding: '10px 14px', fontSize: 12.5, fontWeight: i === 0 ? 700 : 500,
                  color: i === 0 ? COLORS.primary : COLORS.muted,
                  borderBottom: i === 0 ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                  marginBottom: -1, cursor: 'pointer',
                }}>{t}</div>
              ))}
            </div>
          </div>

          {/* Body grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
            {/* Left: description + line items + attachments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Description de la commande</span>
                  <Badge color="#a855f7" soft><Icon name="sparkle" size={10} /> extrait IA</Badge>
                  <div style={{ flex: 1 }} />
                  <Icon name="edit" size={14} color={COLORS.muted} />
                </div>
                <div style={{
                  padding: 16, background: '#fffef7', borderRadius: 10,
                  border: `1px dashed ${COLORS.borderStrong}`,
                  fontFamily: '"Caveat",cursive,sans-serif',
                  fontSize: 24, color: COLORS.primary, fontWeight: 600, lineHeight: 1.3,
                  transform: 'rotate(-0.3deg)',
                }}>
                  50 Carte Visite Carton
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: COLORS.muted, display: 'flex', gap: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: '#a855f7' }} /> Design
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.primary }} /> Impression
                  </span>
                </div>
              </div>

              {/* Line items */}
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Lignes du catalogue <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500 }}>(optionnel)</span>
                </div>
                {[
                  { name: 'Carte de visite carton 250g · finition mate', qty: 50, unit: 0.180, total: 9.000 },
                  { name: 'Forfait création / mise en page', qty: 1, unit: 3.000, total: 3.000 },
                ].map(li => (
                  <div key={li.name} style={{
                    padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`,
                    display: 'grid', gridTemplateColumns: '1fr 60px 80px 80px',
                    fontSize: 12.5, alignItems: 'center', gap: 10,
                  }}>
                    <div>{li.name}</div>
                    <div style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: COLORS.muted }}>×{li.qty}</div>
                    <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: COLORS.muted }}>{li.unit.toFixed(3)}</div>
                    <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{li.total.toFixed(3)}</div>
                  </div>
                ))}
                <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 700, background: COLORS.bg }}>
                  <div style={{ flex: 1, color: COLORS.muted }}>Total catalogue</div>
                  <div style={{ fontVariantNumeric: 'tabular-nums' }}>12,000 TND</div>
                </div>
              </div>

              {/* Attachments */}
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Pièces jointes</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { kind: 'Pochette scannée', col: '#a855f7', icon: 'scan' },
                    { kind: 'Maquette V1', col: COLORS.primary, icon: 'image' },
                    { kind: 'Maquette V2', col: COLORS.success, icon: 'image' },
                    { kind: '+ Ajouter', col: COLORS.mutedSoft, icon: 'plus', empty: true },
                  ].map((a, i) => (
                    <div key={i} style={{
                      aspectRatio: '1', borderRadius: 10,
                      background: a.empty ? 'transparent' : a.col + '0d',
                      border: a.empty ? `1.5px dashed ${COLORS.borderStrong}` : `1px solid ${COLORS.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                      gap: 4, color: a.col, cursor: 'pointer', position: 'relative',
                    }}>
                      <Icon name={a.icon} size={20} />
                      <div style={{ fontSize: 9.5, fontWeight: 600, color: a.empty ? COLORS.muted : a.col, textAlign: 'center', padding: '0 4px' }}>{a.kind}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: timeline + payment + meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Timeline */}
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Avancement</div>
                <div style={{ position: 'relative' }}>
                  {timeline.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i === timeline.length - 1 ? 0 : 14, position: 'relative' }}>
                      {i < timeline.length - 1 && (
                        <div style={{ position: 'absolute', left: 9, top: 22, bottom: 0, width: 2, background: t.done ? StatusMap[t.st] : COLORS.border }} />
                      )}
                      <div style={{
                        width: 20, height: 20, borderRadius: 999, flex: '0 0 auto',
                        background: t.done ? StatusMap[t.st] : '#fff',
                        border: `2px solid ${t.done ? StatusMap[t.st] : COLORS.borderStrong}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: t.current ? `0 0 0 5px ${StatusMap[t.st]}26` : 'none',
                      }}>
                        {t.done && <Icon name="check" size={11} color="#fff" stroke={3} />}
                      </div>
                      <div style={{ flex: 1, paddingTop: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: t.current ? 700 : 600, color: t.done ? COLORS.text : COLORS.muted }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 1 }}>{t.who} · {t.t}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments */}
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>Paiements</span>
                  <button style={{ height: 26, padding: '0 10px', borderRadius: 6, border: 'none', background: COLORS.primary, color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="plus" size={11} /> Encaisser
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <span style={{ color: COLORS.muted }}>Total commande</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>12,000 TND</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <span style={{ color: COLORS.muted }}>Acompte</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>0,000 TND</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                    <span style={{ color: COLORS.muted }}>Remise</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>—</span>
                  </div>
                  <div style={{ height: 1, background: COLORS.border, margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: COLORS.warning }}>
                    <span>Reste à payer</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>12,000 TND</span>
                  </div>
                </div>
                <div style={{ marginTop: 14, padding: 10, borderRadius: 8, background: '#fefce8', border: '1px solid #fde68a', fontSize: 11.5, color: '#854d0e', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="bell" size={14} /> À encaisser à la livraison · prévue aujourd'hui 17:00
                </div>
              </div>

              {/* Meta */}
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Informations</div>
                {[
                  { l: 'Boutique', v: 'B1 · Av. Bourguiba' },
                  { l: 'Créée par', v: 'Sonia · 9 mai 14:22' },
                  { l: 'Assignée à', v: 'Karim · Designer', avatar: { initials: 'KA', color: '#a855f7' } },
                  { l: 'Niveau d\'urgence', v: 'URGENT', urg: 'URGENT' },
                  { l: 'Sous-statut prod.', v: '—' },
                  { l: 'Source', v: 'Pochette scannée · IA 94%' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 12, borderBottom: i < 5 ? `1px solid ${COLORS.border}` : 'none' }}>
                    <span style={{ color: COLORS.muted }}>{m.l}</span>
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {m.urg && <UrgencyDot level={m.urg} />}
                      {m.avatar && <span style={{ width: 16, height: 16, borderRadius: 999, background: m.avatar.color, color: '#fff', fontWeight: 700, fontSize: 8.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{m.avatar.initials}</span>}
                      {m.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────── Public Tracking ─────────────────────────
const TrackingScreen = () => {
  const steps = [
    { label: 'Reçue', icon: 'check', done: true },
    { label: 'En préparation', icon: 'edit', done: true, current: true },
    { label: 'Production', icon: 'print', done: false },
    { label: 'Prête', icon: 'bag', done: false },
    { label: 'Livrée', icon: 'check', done: false },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text,
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32,
      backgroundImage: `radial-gradient(circle at 50% 0%, ${COLORS.primary}10, transparent 60%)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 540, marginBottom: 32 }}>
        <Logo />
        <div style={{ display: 'flex', gap: 4, fontSize: 11, color: COLORS.muted }}>
          <span style={{ padding: '4px 10px', borderRadius: 999, background: '#fff', border: `1px solid ${COLORS.border}`, fontWeight: 600, color: COLORS.text }}>FR</span>
          <span style={{ padding: '4px 10px', borderRadius: 999 }}>عربي</span>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 540, background: '#fff', borderRadius: 18, border: `1px solid ${COLORS.border}`, overflow: 'hidden', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}>
        <div style={{ padding: '20px 24px', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: '#fff' }}>
          <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, letterSpacing: 0.4 }}>VOTRE COMMANDE</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'ui-monospace,Menlo,monospace', marginTop: 2 }}>LB-202605-0042</div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="clock" size={16} /> Prévue <b style={{ marginLeft: 4 }}>aujourd'hui 17:00</b> · Boutique 1
          </div>
        </div>
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, letterSpacing: 0.3, marginBottom: 14 }}>STATUT ACTUEL</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <span style={{
              width: 44, height: 44, borderRadius: 12, background: COLORS.stEnCours + '14',
              color: COLORS.stEnCours, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="edit" size={22} /></span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>En cours de création</div>
              <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 1 }}>Notre designer travaille sur votre maquette</div>
            </div>
          </div>
          {/* Steps */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', marginBottom: 18, padding: '0 6px' }}>
            <div style={{ position: 'absolute', top: 18, left: 24, right: 24, height: 3, background: COLORS.border, borderRadius: 999 }} />
            <div style={{ position: 'absolute', top: 18, left: 24, width: '32%', height: 3, background: COLORS.success, borderRadius: 999 }} />
            {steps.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, flex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 999,
                  background: s.done ? COLORS.success : '#fff',
                  border: `2.5px solid ${s.current ? COLORS.stEnCours : (s.done ? COLORS.success : COLORS.borderStrong)}`,
                  color: s.done ? '#fff' : (s.current ? COLORS.stEnCours : COLORS.mutedSoft),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: s.current ? `0 0 0 5px ${COLORS.stEnCours}1f` : 'none',
                }}><Icon name={s.icon} size={15} stroke={2.4} /></div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: s.done || s.current ? COLORS.text : COLORS.muted, textAlign: 'center' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Footer info */}
          <div style={{ padding: 14, borderRadius: 10, background: COLORS.bg, fontSize: 12, lineHeight: 1.55 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: COLORS.muted }}>Bonjour</span>
              <span style={{ fontWeight: 600 }}>Abdelwahab</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: COLORS.muted }}>Reste à régler</span>
              <span style={{ fontWeight: 700, color: COLORS.warning, fontVariantNumeric: 'tabular-nums' }}>12,000 TND</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: COLORS.muted }}>Vous serez prévenu par SMS dès que c'est prêt.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button style={{ flex: 1, height: 44, borderRadius: 10, border: `1px solid ${COLORS.border}`, background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT, color: COLORS.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="phone" size={14} /> Appeler le labo
            </button>
            <button style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: '#25D366', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="msg" size={14} /> WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 11, color: COLORS.mutedSoft, textAlign: 'center' }}>
        Labo Photo Numérique EL BENNA · Houmet Souk, Djerba<br/>
        elbenna-lab.tn/track/LB-202605-0042
      </div>
    </div>
  );
};

window.OrderDetailScreen = OrderDetailScreen;
window.TrackingScreen = TrackingScreen;
