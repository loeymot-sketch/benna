// EL BENNA LAB OS — Dashboard

const StatCard = ({ icon, label, value, sub, color, accent }) => (
  <div style={{
    background: COLORS.panel, border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden',
  }}>
    {accent && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color }} />}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.muted, fontSize: 12, fontWeight: 500 }}>
      <Icon name={icon} size={14} color={color} /> {label}
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6, letterSpacing: -0.5, color: COLORS.text }}>{value}</div>
    {sub && <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 2 }}>{sub}</div>}
  </div>
);

const OrderRow = ({ code, customer, desc, amount, paid, urgency, status, deliv, hot }) => (
  <div style={{
    padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}`,
    display: 'grid', gridTemplateColumns: '110px 1fr 90px 90px 110px',
    alignItems: 'center', gap: 12, fontSize: 12.5,
    background: hot ? '#fef2f2' : 'transparent',
  }}>
    <div>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontWeight: 600, fontSize: 11.5 }}>{code}</div>
      <div style={{ fontSize: 10, color: COLORS.muted }}>#{customer.pouch}</div>
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
        <UrgencyDot level={urgency} />
        <span>{customer.name}</span>
        <span style={{ color: COLORS.mutedSoft, fontWeight: 400, fontSize: 11 }}>· {customer.phone}</span>
      </div>
      <div style={{ color: COLORS.muted, fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</div>
    </div>
    <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
      <div style={{ fontWeight: 600 }}>{amount} <span style={{ fontSize: 10, color: COLORS.muted }}>TND</span></div>
      <div style={{ fontSize: 10.5, color: paid >= amount ? COLORS.success : COLORS.warning }}>
        {paid >= amount ? 'Payée' : `Reste ${(amount - paid).toFixed(3)}`}
      </div>
    </div>
    <div><StatusPill status={status} /></div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontWeight: 600, fontSize: 11.5 }}>{deliv.day}</div>
      <div style={{ fontSize: 10.5, color: deliv.late ? COLORS.danger : COLORS.muted, fontWeight: deliv.late ? 700 : 500 }}>{deliv.time}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const orders = [
    { code: 'LB-202605-0042', customer: { name: 'Abdelwahab Khelifi', phone: '+216 22 145 332', pouch: '0061340' }, desc: '50 cartes visite carton 250g + finition mate', amount: 12.000, paid: 0, urgency: 'URGENT', status: 'EN_COURS_DESIGN', deliv: { day: "Aujourd'hui", time: '17:00', late: false }, hot: true },
    { code: 'LB-202605-0041', customer: { name: 'Hela Ben Romdhane', phone: '+216 98 224 109', pouch: '0061339' }, desc: 'Photobook mariage A4 — 30 pages, couverture cuir', amount: 185.000, paid: 90.000, urgency: 'PRIORITAIRE', status: 'EN_PRODUCTION', deliv: { day: 'Lun. 11', time: '10:30', late: false } },
    { code: 'LB-202605-0040', customer: { name: 'Mohamed Trabelsi', phone: '+216 55 718 904', pouch: '0061338' }, desc: '2 t-shirts sublim taille L + 4 mugs photo "Famille"', amount: 78.500, paid: 78.500, urgency: 'NORMAL', status: 'PRETE', deliv: { day: 'Hier', time: '16:00', late: true }, hot: true },
    { code: 'LB-202605-0039', customer: { name: 'Studio Maya Events', phone: '+216 71 332 008', pouch: '0061337' }, desc: 'Faire-part mariage 200 ex. + enveloppes assorties', amount: 340.000, paid: 100.000, urgency: 'EXPRESS', status: 'VALIDATION_CLIENT', deliv: { day: "Aujourd'hui", time: '12:00', late: false }, hot: true },
    { code: 'LB-202605-0038', customer: { name: 'Salma Bouazizi', phone: '+216 27 901 442', pouch: '0061336' }, desc: '8 photos identité format CIN + biométrie passeport', amount: 9.000, paid: 9.000, urgency: 'NORMAL', status: 'LIVREE', deliv: { day: 'Hier', time: '14:00', late: false } },
    { code: 'LB-202605-0037', customer: { name: 'Ahmed Mejri', phone: '+216 99 056 213', pouch: '0061335' }, desc: 'Logo + charte graphique — restaurant "Dar Yassmine"', amount: 450.000, paid: 200.000, urgency: 'PRIORITAIRE', status: 'EN_COURS_DESIGN', deliv: { day: 'Mer. 13', time: '09:00', late: false } },
  ];

  const services = [
    { name: 'Impression', pct: 34, color: COLORS.primary },
    { name: 'Sublimation', pct: 22, color: COLORS.accent },
    { name: 'Design', pct: 18, color: '#a855f7' },
    { name: 'Photobook', pct: 12, color: '#f97316' },
    { name: 'Studio', pct: 9, color: '#16a34a' },
    { name: 'Identité', pct: 5, color: '#64748b' },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <Sidebar active="dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="Tableau de bord" subtitle="Samedi 9 mai 2026 · Boutique 1 · Bourguiba" />
        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {/* Stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            <StatCard icon="fire" label="Urgentes aujourd'hui" value="7" sub="dont 2 EXPRESS ⚫" color={COLORS.danger} accent />
            <StatCard icon="clock" label="À livrer aujourd'hui" value="14" sub="prochaine: 12:00" color={COLORS.warning} accent />
            <StatCard icon="calendar" label="À livrer demain" value="22" sub="anticiper la prod" color={COLORS.primary} accent />
            <StatCard icon="x" label="En retard" value="3" sub="action requise" color={COLORS.danger} accent />
            <StatCard icon="cash" label="Caisse du jour" value="2 847,500" sub="TND · 38 encaissements" color={COLORS.success} accent />
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, marginTop: 18 }}>
            {/* Orders list */}
            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{
                padding: '14px 16px', borderBottom: `1px solid ${COLORS.border}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>Commandes prioritaires</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Toutes', 'Aujourd\'hui', 'En retard', 'Mes tâches'].map((f, i) => (
                    <div key={f} style={{
                      padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                      background: i === 1 ? COLORS.primary + '14' : 'transparent',
                      color: i === 1 ? COLORS.primary : COLORS.muted,
                      border: `1px solid ${i === 1 ? COLORS.primary + '33' : COLORS.border}`,
                      cursor: 'pointer',
                    }}>{f}</div>
                  ))}
                </div>
              </div>
              <div style={{
                padding: '8px 14px', display: 'grid',
                gridTemplateColumns: '110px 1fr 90px 90px 110px',
                gap: 12, fontSize: 10.5, color: COLORS.muted, fontWeight: 600, letterSpacing: 0.4,
                textTransform: 'uppercase', borderBottom: `1px solid ${COLORS.border}`,
                background: COLORS.bg,
              }}>
                <div>Code · Pochette</div>
                <div>Client · Description</div>
                <div style={{ textAlign: 'right' }}>Montant</div>
                <div>Statut</div>
                <div style={{ textAlign: 'right' }}>Livraison</div>
              </div>
              {orders.map(o => <OrderRow key={o.code} {...o} />)}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Services pie */}
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Répartition par service · 7 jours</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Donut */}
                  <svg width={120} height={120} viewBox="0 0 42 42">
                    {(() => {
                      let acc = 0;
                      return services.map((s, i) => {
                        const dash = `${s.pct} ${100 - s.pct}`;
                        const offset = 25 - acc;
                        acc += s.pct;
                        return (
                          <circle key={i} cx="21" cy="21" r="15.91549431" fill="transparent"
                            stroke={s.color} strokeWidth="6" strokeDasharray={dash} strokeDashoffset={offset} />
                        );
                      });
                    })()}
                    <text x="21" y="20" textAnchor="middle" fontSize="5" fontWeight="700" fill={COLORS.text} fontFamily={FONT}>284</text>
                    <text x="21" y="25" textAnchor="middle" fontSize="3" fill={COLORS.muted} fontFamily={FONT}>commandes</text>
                  </svg>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {services.map(s => (
                      <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                        <span style={{ flex: 1, color: COLORS.text }}>{s.name}</span>
                        <span style={{ color: COLORS.muted, fontVariantNumeric: 'tabular-nums' }}>{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workload */}
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Charge de travail</div>
                {[
                  { name: 'Karim · Designer', count: 8, max: 12, color: '#a855f7' },
                  { name: 'Mehdi · Production', count: 11, max: 12, color: '#f97316' },
                  { name: 'Yosra · Réception', count: 4, max: 12, color: '#14b8a6' },
                  { name: 'Nizar · Photographe', count: 3, max: 8, color: '#16a34a' },
                ].map(m => (
                  <div key={m.name} style={{ marginBottom: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span style={{ color: COLORS.muted, fontVariantNumeric: 'tabular-nums' }}>{m.count}/{m.max}</span>
                    </div>
                    <div style={{ height: 6, background: COLORS.bg, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        width: `${(m.count / m.max) * 100}%`, height: '100%',
                        background: m.count / m.max > 0.85 ? COLORS.danger : m.color,
                        borderRadius: 999,
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Notifications */}
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Activité récente</div>
                {[
                  { icon: 'check', color: COLORS.success, txt: <><b>Karim</b> a validé la maquette de <b>LB-…0037</b></>, t: 'il y a 3 min' },
                  { icon: 'cash', color: COLORS.primary, txt: <><b>Sonia</b> a encaissé <b>120,000 TND</b> · LB-…0041</>, t: 'il y a 12 min' },
                  { icon: 'msg', color: COLORS.accent, txt: <>SMS envoyé à <b>Abdelwahab K.</b> — commande prête</>, t: 'il y a 28 min' },
                  { icon: 'scan', color: '#a855f7', txt: <>Pochette <b>#0061340</b> scannée par IA · 94% confiance</>, t: 'il y a 1 h' },
                ].map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', alignItems: 'flex-start' }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 8, background: n.color + '14', color: n.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
                    }}><Icon name={n.icon} size={13} /></span>
                    <div style={{ flex: 1, fontSize: 11.5, lineHeight: 1.4 }}>
                      <div>{n.txt}</div>
                      <div style={{ color: COLORS.mutedSoft, fontSize: 10.5, marginTop: 1 }}>{n.t}</div>
                    </div>
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

window.Dashboard = Dashboard;
window.StatCard = StatCard;
