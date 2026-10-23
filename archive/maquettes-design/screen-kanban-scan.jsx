// EL BENNA LAB OS — Kanban + Scan + Order Detail screens

// ───────────────────────── Kanban ─────────────────────────
const KanbanCard = ({ code, customer, desc, urgency, deliv, assignee, amount, paid, services }) => (
  <div style={{
    background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10,
    padding: 11, marginBottom: 8, cursor: 'grab',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <UrgencyDot level={urgency} />
      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10.5, color: COLORS.muted, fontWeight: 600 }}>{code}</span>
      <div style={{ flex: 1 }} />
      {urgency === 'EXPRESS' && <Badge color={COLORS.urgExpress} style={{ fontSize: 9, padding: '1px 6px' }}>EXPRESS</Badge>}
      {urgency === 'URGENT' && <Badge color={COLORS.danger} style={{ fontSize: 9, padding: '1px 6px' }}>URGENT</Badge>}
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{customer}</div>
    <div style={{ fontSize: 11.5, color: COLORS.muted, lineHeight: 1.35, marginBottom: 8,
      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</div>
    {services && (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        {services.map(s => (
          <span key={s} style={{
            fontSize: 9.5, padding: '1px 6px', borderRadius: 4,
            background: COLORS.bg, color: COLORS.muted, fontWeight: 600,
            border: `1px solid ${COLORS.border}`,
          }}>{s}</span>
        ))}
      </div>
    )}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, color: COLORS.muted }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Icon name="clock" size={11} /> {deliv}
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ fontWeight: 600, color: paid >= amount ? COLORS.success : COLORS.warning, fontVariantNumeric: 'tabular-nums' }}>
        {paid >= amount ? '✓ payée' : `${(amount - paid).toFixed(0)}TND dû`}
      </span>
      <div style={{
        width: 22, height: 22, borderRadius: 999, background: assignee.color,
        color: '#fff', fontWeight: 700, fontSize: 9.5,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2,
      }}>{assignee.initials}</div>
    </div>
  </div>
);

const KanbanScreen = () => {
  const cols = [
    { id: 'recue', title: 'Reçue', color: COLORS.stRecue, count: 4, cards: [
      { code: 'LB-…0044', customer: 'Yassine Hammami', desc: '100 flyers A5 recto/verso · vernis sélectif', urgency: 'NORMAL', deliv: 'Mer. 13', assignee: { initials: 'SO', color: '#3b82f6' }, amount: 85, paid: 0, services: ['Impression'] },
      { code: 'LB-…0045', customer: 'Imen Karoui', desc: '4 photos identité format CIN', urgency: 'NORMAL', deliv: "Auj. 17h", assignee: { initials: 'YO', color: '#14b8a6' }, amount: 6, paid: 6, services: ['ID'] },
      { code: 'LB-…0046', customer: 'Café Le Phare', desc: 'Menu A3 plié · 40 ex laminés', urgency: 'PRIORITAIRE', deliv: 'Mar. 12', assignee: { initials: 'SO', color: '#3b82f6' }, amount: 145, paid: 50, services: ['Impression', 'Laminage'] },
    ]},
    { id: 'design', title: 'Design', color: COLORS.stEnCours, count: 5, cards: [
      { code: 'LB-…0042', customer: 'Abdelwahab Khelifi', desc: '50 cartes visite carton 250g · finition mate', urgency: 'URGENT', deliv: "Auj. 17h", assignee: { initials: 'KA', color: '#a855f7' }, amount: 12, paid: 0, services: ['Design', 'Impression'] },
      { code: 'LB-…0037', customer: 'Resto Dar Yassmine', desc: 'Logo + charte graphique complète + carte', urgency: 'PRIORITAIRE', deliv: 'Mer. 13', assignee: { initials: 'KA', color: '#a855f7' }, amount: 450, paid: 200, services: ['Design'] },
    ]},
    { id: 'validation', title: 'Validation client', color: COLORS.stValidation, count: 3, cards: [
      { code: 'LB-…0039', customer: 'Studio Maya Events', desc: 'Faire-part mariage 200 ex + enveloppes', urgency: 'EXPRESS', deliv: "Auj. 12h", assignee: { initials: 'KA', color: '#a855f7' }, amount: 340, paid: 100, services: ['Design', 'Impression'] },
      { code: 'LB-…0033', customer: 'Salon Massinissa', desc: 'Bâche 3×1m grand format extérieur', urgency: 'PRIORITAIRE', deliv: 'Lun. 11', assignee: { initials: 'KA', color: '#a855f7' }, amount: 220, paid: 100, services: ['Design'] },
    ]},
    { id: 'production', title: 'Production', color: COLORS.stProduction, count: 6, cards: [
      { code: 'LB-…0041', customer: 'Hela Ben Romdhane', desc: 'Photobook mariage A4 · 30p · couverture cuir', urgency: 'PRIORITAIRE', deliv: 'Lun. 11', assignee: { initials: 'ME', color: '#f97316' }, amount: 185, paid: 90, services: ['Photobook'] },
      { code: 'LB-…0036', customer: 'École Al Amal', desc: '24 t-shirts sublim taille S · logo école', urgency: 'NORMAL', deliv: 'Mar. 12', assignee: { initials: 'ME', color: '#f97316' }, amount: 312, paid: 312, services: ['Sublimation'] },
      { code: 'LB-…0034', customer: 'Cabinet Dr. Zouari', desc: 'Tampons + ordonnanciers personnalisés', urgency: 'NORMAL', deliv: 'Jeu. 14', assignee: { initials: 'ME', color: '#f97316' }, amount: 95, paid: 0, services: ['Impression'] },
    ]},
    { id: 'prete', title: 'Prête', color: COLORS.stPrete, count: 8, cards: [
      { code: 'LB-…0040', customer: 'Mohamed Trabelsi', desc: '2 t-shirts L + 4 mugs photo "Famille"', urgency: 'NORMAL', deliv: 'Hier', assignee: { initials: 'ME', color: '#f97316' }, amount: 78.5, paid: 78.5, services: ['Sublimation'] },
      { code: 'LB-…0029', customer: 'Atelier Bijou', desc: '500 étiquettes adhésives Ø40mm', urgency: 'NORMAL', deliv: 'Hier', assignee: { initials: 'ME', color: '#f97316' }, amount: 65, paid: 30, services: ['Impression'] },
    ]},
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <Sidebar active="kanban" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="Kanban — flux de production" subtitle="26 commandes actives · glisser pour changer de statut" />
        {/* Filter bar */}
        <div style={{
          padding: '12px 24px', borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex', gap: 8, alignItems: 'center', background: COLORS.panel,
        }}>
          {[
            { l: 'Toutes les boutiques', active: true },
            { l: 'Tous les services' },
            { l: 'Toute urgence' },
            { l: 'Tous les membres' },
          ].map(f => (
            <div key={f.l} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: COLORS.bg, color: COLORS.text,
              border: `1px solid ${COLORS.border}`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>{f.l} <span style={{ color: COLORS.muted, fontSize: 9 }}>▾</span></div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: COLORS.primary + '14', color: COLORS.primary,
            border: `1px solid ${COLORS.primary}33`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>Mes commandes <span style={{ background: COLORS.primary, color: '#fff', padding: '0 5px', borderRadius: 999, fontSize: 10 }}>5</span></div>
        </div>
        {/* Columns */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', gap: 12 }}>
          {cols.map(c => (
            <div key={c.id} style={{ flex: '0 0 270px', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '10px 12px', background: COLORS.panel, borderRadius: 10,
                border: `1px solid ${COLORS.border}`, marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 8,
                borderTop: `3px solid ${c.color}`,
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, flex: 1 }}>{c.title}</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                  background: c.color + '1a', color: c.color,
                }}>{c.count}</span>
                <Icon name="plus" size={14} color={COLORS.muted} />
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: '0 2px' }}>
                {c.cards.map(card => <KanbanCard key={card.code} {...card} />)}
                {c.id === 'production' && (
                  <div style={{
                    border: `2px dashed ${COLORS.border}`, borderRadius: 10,
                    padding: 16, textAlign: 'center', color: COLORS.mutedSoft,
                    fontSize: 11, marginTop: 4,
                  }}>Glisser une commande ici</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ───────────────────────── Scan / IA Vision ─────────────────────────
const ScanScreen = () => {
  const fields = [
    { label: 'N° pochette', value: '0061340', conf: 0.98 },
    { label: 'Nom client', value: 'Abdelwahab Khelifi', conf: 0.86 },
    { label: 'GSM', value: '', conf: 0.0, hint: 'non rempli sur la pochette' },
    { label: 'Date', value: '', conf: 0.0, hint: 'non rempli sur la pochette' },
    { label: 'Cachet (total)', value: '12,000 TND', conf: 0.78 },
    { label: 'Acompte', value: '0,000 TND', conf: 0.92 },
    { label: 'Description', value: '50 Carte Visite Carton', conf: 0.93, multi: true },
  ];

  const confColor = c => c >= 0.8 ? COLORS.success : c >= 0.6 ? COLORS.warning : COLORS.danger;
  const confLabel = c => c >= 0.8 ? 'OK' : c >= 0.6 ? 'à vérifier' : 'incertain';

  return (
    <div style={{ display: 'flex', height: '100%', background: COLORS.bg, fontFamily: FONT, color: COLORS.text }}>
      <Sidebar active="scan" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="Scanner pochette · IA Vision" subtitle="Extraction automatique des champs manuscrits" />
        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Left: pouch image */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 14,
              padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>Photo de la pochette</span>
                <Badge color={COLORS.success} soft><Icon name="check" size={10} /> traitée</Badge>
              </div>
              {/* Mocked pouch with annotated boxes */}
              <div style={{
                position: 'relative', aspectRatio: '0.72', background: '#fefefa',
                borderRadius: 10, border: `1px solid ${COLORS.border}`, overflow: 'hidden',
                fontFamily: FONT,
              }}>
                {/* Top fields */}
                <div style={{ position: 'absolute', top: '6%', left: '8%', right: '8%', fontSize: 9, color: '#444' }}>
                  <div style={{ marginBottom: 5 }}>Nom : <span style={{ borderBottom: '1px dotted #999', paddingBottom: 1 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
                  <div style={{ marginBottom: 5 }}>Acompte : <span style={{ borderBottom: '1px dotted #999', paddingBottom: 1 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
                  <div style={{ marginBottom: 5 }}>Date : <span style={{ borderBottom: '1px dotted #999', paddingBottom: 1 }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span>GSM : <span style={{ borderBottom: '1px dotted #999' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>
                    <span>Cachet : <span style={{ borderBottom: '1px dotted #999' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: '4%', right: '8%', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#222' }}>0061340</div>
                <div style={{ position: 'absolute', top: '24%', left: '6%', right: '6%', fontSize: 7.5, color: '#dc2626' }}>NB : Le Labo n'est plus responsable des produits des clients après un délai de 6 mois.</div>
                {/* Description box */}
                <div style={{
                  position: 'absolute', top: '28%', left: '8%', right: '8%', height: '28%',
                  border: '1.5px solid #16a34a', borderRadius: 4, padding: 8,
                }}>
                  <div style={{ fontFamily: '"Caveat",cursive,sans-serif', fontSize: 18, color: '#1e40af', transform: 'rotate(-2deg)' }}>
                    50 Carte Visite Carton
                  </div>
                </div>
                {/* Logo */}
                <div style={{ position: 'absolute', top: '60%', left: '8%', right: '50%', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: 14, color: COLORS.primary, fontWeight: 600 }}>Labo Photo Numérique</div>
                  <div style={{ fontFamily: '"Caveat",cursive,sans-serif', fontSize: 18, color: COLORS.accent, fontWeight: 700, lineHeight: 1 }}>EL BENNA</div>
                  <div style={{ fontSize: 5.5, color: '#444', marginTop: 4, lineHeight: 1.4 }}>
                    66, Av. Habib Bourguiba 4180 Houmet Souk - Djerba<br/>
                    9, Place Ouled Haffouz - Houmet Souk - Djerba<br/>
                    labo.elbenna@gmail.com
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <div style={{ color: COLORS.accent, fontSize: 10, fontWeight: 700, lineHeight: 1.4 }}>
                      Laminage<br/>Photobook<br/>Sublimation
                    </div>
                  </div>
                </div>
                {/* Right card with handwriting */}
                <div style={{
                  position: 'absolute', top: '60%', right: '8%', width: '38%', height: '24%',
                  border: '1px solid #16a34a', borderRadius: 4, padding: 6, fontSize: 7.5, color: '#444',
                }}>
                  <div>Nom : <span style={{ fontFamily: '"Caveat",cursive,sans-serif', fontSize: 13, color: '#1e40af' }}>Abdelwahab</span></div>
                  <div style={{ marginTop: 3 }}>Acompte :</div>
                  <div style={{ marginTop: 3 }}>Date :</div>
                  <div style={{ marginTop: 3 }}>GSM :</div>
                  <div style={{ marginTop: 3 }}>Cachet : <span style={{ fontFamily: '"Caveat",cursive,sans-serif', fontSize: 13, color: '#1e40af' }}>12,000</span></div>
                </div>
                {/* AI annotation overlays */}
                <div style={{ position: 'absolute', top: '2%', right: '6%', width: '28%', height: '6%', border: `2px solid ${COLORS.success}`, borderRadius: 4, pointerEvents: 'none' }}>
                  <span style={{ position: 'absolute', top: -16, right: 0, fontSize: 9, color: COLORS.success, fontWeight: 700, background: '#fff', padding: '1px 4px', borderRadius: 3 }}>0061340 · 98%</span>
                </div>
                <div style={{ position: 'absolute', top: '28%', left: '8%', width: '84%', height: '28%', border: `2px solid ${COLORS.primary}`, borderRadius: 4, pointerEvents: 'none' }}>
                  <span style={{ position: 'absolute', bottom: -16, left: 0, fontSize: 9, color: COLORS.primary, fontWeight: 700, background: '#fff', padding: '1px 4px', borderRadius: 3 }}>description · 93%</span>
                </div>
                <div style={{ position: 'absolute', top: '60%', right: '8%', width: '38%', height: '24%', border: `2px dashed ${COLORS.warning}`, borderRadius: 4, pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Provider info */}
            <div style={{
              background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12,
              padding: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
            }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: '#a855f714', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="sparkle" size={15} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>GLM-OCR · Z.ai</div>
                <div style={{ color: COLORS.muted, fontSize: 11 }}>Extraction en 2,4 s · 1 094 tokens · ≈ 0,000 033 USD</div>
              </div>
              <Badge color={COLORS.success} soft>en ligne</Badge>
            </div>
          </div>

          {/* Right: extracted form */}
          <div style={{
            background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 14,
            padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="sparkle" size={18} color="#a855f7" />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Champs extraits par IA</span>
              <div style={{ flex: 1 }} />
              <Badge color="#a855f7" soft>5/7 fiables</Badge>
              <Badge color={COLORS.warning} soft>2 à vérifier</Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fields.map(f => (
                <div key={f.label} style={{
                  border: `1px solid ${f.conf < 0.7 ? COLORS.warning : COLORS.border}`,
                  borderRadius: 10, padding: '8px 10px',
                  background: f.conf < 0.7 ? '#fffbeb' : '#fff',
                  display: 'flex', alignItems: f.multi ? 'flex-start' : 'center', gap: 10,
                }}>
                  <div style={{ flex: '0 0 110px', fontSize: 11.5, color: COLORS.muted, fontWeight: 600 }}>{f.label}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {f.value ? (
                      <div style={{
                        fontSize: f.multi ? 14 : 13.5, fontWeight: 600,
                        fontFamily: f.multi ? '"Caveat",cursive,sans-serif' : FONT,
                        color: COLORS.text,
                      }}>{f.value}</div>
                    ) : (
                      <div style={{ fontSize: 12, color: COLORS.mutedSoft, fontStyle: 'italic' }}>{f.hint || '—'}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                    background: confColor(f.conf) + '1a', color: confColor(f.conf),
                  }}>{Math.round(f.conf * 100)}% · {confLabel(f.conf)}</span>
                </div>
              ))}
            </div>

            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button style={{
                flex: 1, height: 44, borderRadius: 10, border: `1px solid ${COLORS.border}`,
                background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT, color: COLORS.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}><Icon name="cam" size={15} /> Reprendre la photo</button>
              <button style={{
                flex: 2, height: 44, borderRadius: 10, border: 'none',
                background: COLORS.primary, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}><Icon name="arrow" size={15} /> Créer la commande pré-remplie</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.KanbanScreen = KanbanScreen;
window.ScanScreen = ScanScreen;
