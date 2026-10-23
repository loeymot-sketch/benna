// EL BENNA · AI Studio (desktop module)
// Bulk image enhance (upscale, restore, denoise) + AI image generation
// Backend-agnostic UI — Adel branche les APIs lui-même

const A = {
  bg: '#f5f5f7', panel: '#fff', text: '#0f172a', muted: '#64748b',
  border: '#e5e7eb', primary: '#1e3a8a', accent: '#dc2626',
  success: '#16a34a', warning: '#f59e0b', purple: '#a855f7',
};

// ────────── 1) Studio · vue principale ──────────
const AIStudio = () => {
  const items = [
    { n: 'mariage_001.cr3', s: '24 MB', state: 'done',  before: '24MP', after: '96MP · 4K', tag: 'Upscale ×4', tagC: A.primary },
    { n: 'mariage_002.cr3', s: '23 MB', state: 'done',  before: '24MP', after: '96MP · 4K', tag: 'Upscale ×4', tagC: A.primary },
    { n: 'portrait_yas.jpg', s: '4.2 MB', state: 'done', before: 'flou', after: 'net + visage', tag: 'Restore visage', tagC: A.success },
    { n: 'portrait_med.jpg', s: '3.8 MB', state: 'doing', pct: 67, tag: 'Restore visage', tagC: A.success },
    { n: 'product_01.png', s: '8.1 MB', state: 'doing', pct: 32, tag: 'Denoise + sharp', tagC: A.purple },
    { n: 'product_02.png', s: '7.9 MB', state: 'queue', tag: 'Denoise + sharp', tagC: A.purple },
    { n: 'product_03.png', s: '8.4 MB', state: 'queue', tag: 'Denoise + sharp', tagC: A.purple },
    { n: 'product_04.png', s: '8.0 MB', state: 'queue', tag: 'Denoise + sharp', tagC: A.purple },
    { n: 'IMG_4587.heic', s: '5.6 MB', state: 'fail', tag: 'Upscale ×4', tagC: A.primary, err: 'format non supporté' },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: A.bg, fontFamily: FONT, color: A.text }}>
      <Sidebar active="ai" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          title="✨ Studio IA"
          subtitle="Améliorer la qualité · Upscale · Restaurer · Générer — propulsé par IA"
          right={
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={btnGhost}>Historique</button>
              <button style={btnPrimary}>+ Nouveau lot</button>
            </div>
          }
        />

        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
          {/* LEFT — work area */}
          <div>
            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[
                { e: '⤴', t: 'Améliorer / Upscale', d: '1 → 1000 photos', on: true },
                { e: '👤', t: 'Restaurer visage', d: 'photos anciennes / floues' },
                { e: '🧹', t: 'Denoiser + Sharpen', d: 'iso élevé, basse lumière' },
                { e: '✂', t: 'Détourer / Fond', d: 'détourage produit' },
                { e: '🎨', t: 'Générer', d: 'depuis un prompt texte' },
              ].map(m => (
                <div key={m.t} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${m.on ? A.primary : A.border}`, background: m.on ? A.primary + '0d' : '#fff', cursor: 'pointer' }}>
                  <div style={{ fontSize: 16 }}>{m.e}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 4, color: m.on ? A.primary : A.text }}>{m.t}</div>
                  <div style={{ fontSize: 10, color: A.muted, marginTop: 1 }}>{m.d}</div>
                </div>
              ))}
            </div>

            {/* Dropzone */}
            <div style={{ background: '#fff', borderRadius: 12, border: `2px dashed ${A.primary}66`, padding: '24px', textAlign: 'center', marginBottom: 14, position: 'relative' }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>📤</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Déposer 1 à 1000 photos ici</div>
              <div style={{ fontSize: 11.5, color: A.muted, marginTop: 4 }}>JPG · PNG · HEIC · TIFF · CR3 · NEF · DNG · WebP — max 50 MB / fichier</div>
              <button style={{ marginTop: 12, height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: A.primary, color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT }}>Choisir des fichiers…</button>
              <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 10.5, color: A.muted }}>📁 ou glisser un dossier entier</div>
            </div>

            {/* Batch progress */}
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${A.border}`, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Lot du 18 mai · 09:42 · Mariage Bouzid</div>
                  <div style={{ fontSize: 11, color: A.muted, marginTop: 2 }}>9 photos · 3 modes · destinataire : Karim</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: A.warning, background: '#fef3c7', padding: '4px 9px', borderRadius: 4 }}>● EN COURS</span>
              </div>
              {/* progress */}
              <div style={{ height: 8, background: A.bg, borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ width: '46%', height: '100%', background: `linear-gradient(90deg, ${A.primary}, ${A.purple})` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: A.muted }}>
                <span><b style={{ color: A.success }}>3</b> terminées · <b style={{ color: A.warning }}>2</b> en cours · <b>4</b> en file · <b style={{ color: A.accent }}>1</b> erreur</span>
                <span>≈ 4 min restantes</span>
              </div>
            </div>

            {/* File grid */}
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${A.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${A.border}`, fontSize: 11, fontWeight: 800, color: A.muted, letterSpacing: 0.4, display: 'flex', alignItems: 'center' }}>
                FICHIERS · 9
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 10.5, fontWeight: 600, color: A.text, marginRight: 12 }}>Trier : récent ▾</span>
              </div>
              {items.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1.6fr 1fr 1.4fr 110px', gap: 12, padding: '11px 14px', borderTop: i ? `1px solid ${A.border}` : 'none', alignItems: 'center', fontSize: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 6, background: 'linear-gradient(135deg,#cbd5e1,#94a3b8)', position: 'relative' }}>
                    {f.state === 'done' && <span style={{ position: 'absolute', bottom: -3, right: -3, width: 18, height: 18, borderRadius: 999, background: A.success, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>✓</span>}
                    {f.state === 'fail' && <span style={{ position: 'absolute', bottom: -3, right: -3, width: 18, height: 18, borderRadius: 999, background: A.accent, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>!</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{f.n}</div>
                    <div style={{ fontSize: 10.5, color: A.muted }}>{f.s} · {f.before ? `${f.before} → ${f.after || '…'}` : f.err || '—'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: f.tagC, background: f.tagC + '14', padding: '3px 8px', borderRadius: 4 }}>{f.tag}</span>
                  </div>
                  <div>
                    {f.state === 'done' && <span style={{ color: A.success, fontWeight: 700, fontSize: 11.5 }}>● Terminée · 12s</span>}
                    {f.state === 'doing' && (
                      <div>
                        <div style={{ fontSize: 11, color: A.warning, fontWeight: 700, marginBottom: 3 }}>● En cours · {f.pct}%</div>
                        <div style={{ height: 4, background: A.bg, borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${f.pct}%`, height: '100%', background: A.warning }} />
                        </div>
                      </div>
                    )}
                    {f.state === 'queue' && <span style={{ color: A.muted, fontSize: 11.5 }}>○ En file</span>}
                    {f.state === 'fail' && <span style={{ color: A.accent, fontWeight: 700, fontSize: 11.5 }}>✗ Échec · réessayer</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button style={iconBtn}>👁</button>
                    <button style={iconBtn}>↓</button>
                    <button style={iconBtn}>⋯</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — settings */}
          <div>
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${A.border}`, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: A.muted, letterSpacing: 0.4, marginBottom: 10 }}>RÉGLAGES — UPSCALE</div>

              <Setting label="Facteur d'agrandissement" value="×4 · jusqu'à 24MP → 96MP" />
              <Setting label="Modèle IA" value="High Fidelity v2" />
              <Setting label="Mode" value="Photo réelle" />
              <Setting label="Préserver la peau" value="Oui · doux" toggle />
              <Setting label="Réduire le bruit" value="Auto" />
              <Setting label="Restaurer les visages" value="Désactivé" toggle off />
              <Setting label="Format de sortie" value="JPG qualité 95%" />
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${A.border}`, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: A.muted, letterSpacing: 0.4, marginBottom: 10 }}>DESTINATION</div>
              {[
                { e: '🗂', t: 'Dossier client (auto)', d: '/clients/Bouzid/améliorées', on: true },
                { e: '☁', t: 'Google Drive', d: 'Drive partagé · /labo/IA', on: true },
                { e: '📦', t: 'Office (Adel)', d: 'OneDrive entreprise', on: false },
                { e: '💬', t: 'Lien WhatsApp client', d: 'envoyé en fin de lot', on: false },
              ].map(d => (
                <div key={d.t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <span style={{ fontSize: 18 }}>{d.e}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{d.t}</div>
                    <div style={{ fontSize: 10.5, color: A.muted }}>{d.d}</div>
                  </div>
                  <div style={{ width: 30, height: 18, borderRadius: 999, background: d.on ? A.success : A.border, position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 2, [d.on ? 'right' : 'left']: 2, width: 14, height: 14, borderRadius: 999, background: '#fff' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${A.border}`, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: A.muted, letterSpacing: 0.4, marginBottom: 10 }}>USAGE & QUOTA</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 6 }}>
                <span style={{ color: A.muted }}>Ce mois · 1 247 / 5 000 photos</span>
                <span style={{ fontWeight: 700, color: A.primary }}>25%</span>
              </div>
              <div style={{ height: 6, background: A.bg, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', background: A.primary }} />
              </div>
              <div style={{ fontSize: 10.5, color: A.muted, marginTop: 8, lineHeight: 1.5 }}>
                ⚙️ Plan API configurable dans Paramètres → Intégrations IA
              </div>
            </div>

            <div style={{ background: A.primary, borderRadius: 12, padding: 16, color: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, letterSpacing: 0.4, marginBottom: 6 }}>BACKEND IA · CONNECTÉ</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>OpenAI · principal</div>
              {[
                { t: 'OpenAI · gpt-image-1', d: 'génération + édition + upscale', main: true },
                { t: 'OpenAI · DALL·E 3', d: 'fallback génération' },
                { t: 'Replicate · Real-ESRGAN', d: '⚙ optionnel · upscale ×4', off: true },
              ].map(p => (
                <div key={p.t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11, opacity: p.off ? 0.5 : 1 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: p.off ? '#94a3b8' : '#22c55e' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{p.t} {p.main && <span style={{ fontSize: 9, fontWeight: 800, background: '#fbbf24', color: '#78350f', padding: '1px 5px', borderRadius: 3, marginLeft: 4, letterSpacing: 0.5 }}>★</span>}</div>
                    <div style={{ opacity: 0.7, fontSize: 10 }}>{p.d}</div>
                  </div>
                </div>
              ))}
              <button style={{ marginTop: 10, height: 32, width: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>Configurer les APIs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Setting = ({ label, value, toggle, off }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${A.bg}` }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: A.muted }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{value}</div>
    </div>
    {toggle ? (
      <div style={{ width: 30, height: 18, borderRadius: 999, background: off ? A.border : A.success, position: 'relative' }}>
        <span style={{ position: 'absolute', top: 2, [off ? 'left' : 'right']: 2, width: 14, height: 14, borderRadius: 999, background: '#fff' }} />
      </div>
    ) : (
      <span style={{ fontSize: 12, color: A.muted }}>▾</span>
    )}
  </div>
);

const btnGhost = { height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT };
const btnPrimary = { height: 36, padding: '0 14px', borderRadius: 8, border: 'none', background: A.accent, color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT, boxShadow: `0 2px 8px ${A.accent}33` };
const iconBtn = { width: 28, height: 28, borderRadius: 6, border: `1px solid ${A.border}`, background: '#fff', cursor: 'pointer', fontSize: 11 };

// ────────── 2) Avant / Après — viewer plein écran ──────────
const BeforeAfter = () => {
  return (
    <div style={{ display: 'flex', height: '100%', background: '#0f172a', fontFamily: FONT, color: '#fff' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ height: 56, padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #1e293b', gap: 14 }}>
          <button style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>portrait_yas.jpg</div>
            <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Restaurer visage · GFPGAN v1.4 · 11s</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: A.success, background: '#dcfce7', padding: '4px 9px', borderRadius: 4 }}>✓ TERMINÉE</span>
          <button style={{ height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: FONT }}>Refaire</button>
          <button style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: A.success, color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6 }}>↓ Télécharger</button>
        </div>

        {/* Viewer */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>
          {/* before */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #4b5563, #1f2937)', filter: 'blur(8px) brightness(0.6)' }} />
          <div style={{ position: 'absolute', top: 16, left: 16, fontSize: 10.5, fontWeight: 800, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: 4, letterSpacing: 0.5 }}>AVANT · 1024×768 · flou</div>

          {/* after — clipped half */}
          <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(0 0 0 50%)', background: 'radial-gradient(circle at 60% 40%, #fbbf24 0%, #d97706 30%, #1f2937 80%)' }} />
          <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10.5, fontWeight: 800, color: '#fff', background: A.success, padding: '5px 10px', borderRadius: 4, letterSpacing: 0.5 }}>APRÈS · 4096×3072 · net</div>

          {/* slider */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.3)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 44, height: 44, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: A.text, cursor: 'ew-resize', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>⇆</div>

          {/* badge faces detected */}
          <div style={{ position: 'absolute', top: '38%', right: '22%', width: 90, height: 110, border: `2px solid ${A.success}`, borderRadius: 6 }}>
            <div style={{ position: 'absolute', bottom: -22, left: 0, fontSize: 9.5, fontWeight: 800, background: A.success, color: '#fff', padding: '2px 6px', borderRadius: 3 }}>VISAGE 98%</div>
          </div>
        </div>

        {/* Bottom info */}
        <div style={{ height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', borderTop: '1px solid #1e293b', gap: 24, fontSize: 11 }}>
          <Stat l="DIMENSIONS" v="1024×768 → 4096×3072" />
          <Stat l="POIDS" v="4.2 MB → 16.8 MB" />
          <Stat l="TEMPS" v="11.2s" />
          <Stat l="VISAGES" v="1 détecté · restauré" />
          <Stat l="COÛT API" v="$0.011" />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10.5, color: '#64748b' }}>1/9 du lot · ← précédent · suivant →</span>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ l, v }) => (
  <div>
    <div style={{ fontSize: 9.5, fontWeight: 800, color: '#64748b', letterSpacing: 0.5 }}>{l}</div>
    <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{v}</div>
  </div>
);

// ────────── 3) Génération IA ──────────
const AIGenerate = () => {
  return (
    <div style={{ display: 'flex', height: '100%', background: A.bg, fontFamily: FONT, color: A.text }}>
      <Sidebar active="ai" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="🎨 Générer une image" subtitle="Visuels marketing, mockups produits, fonds — depuis un prompt texte" />
        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'grid', gridTemplateColumns: '380px 1fr', gap: 18 }}>
          {/* Left — composer */}
          <div>
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${A.border}`, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: A.muted, letterSpacing: 0.4, marginBottom: 8 }}>PROMPT</div>
              <div style={{ minHeight: 100, padding: 12, border: `1.5px solid ${A.primary}66`, borderRadius: 10, fontSize: 13, lineHeight: 1.5, background: A.primary + '06' }}>
                Affiche promotionnelle pour le mariage de Yassmine & Mohamed, fond floral pastel, calligraphie élégante "إلى الأبد", style minimaliste, format vertical A3
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {['📐 A3 portrait', '🎨 Photo-réaliste', '⚙️ HD'].map(c => (
                  <span key={c} style={{ fontSize: 10.5, fontWeight: 600, padding: '4px 8px', borderRadius: 4, background: A.bg }}>{c}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${A.border}`, background: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: FONT }}>+ Image de réf</button>
                <button style={{ flex: 2, height: 40, borderRadius: 10, border: 'none', background: A.purple, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: `0 4px 14px ${A.purple}55` }}>✨ Générer 4 variantes</button>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${A.border}`, padding: 16, marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: A.muted, letterSpacing: 0.4, marginBottom: 10 }}>STYLES RAPIDES</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
                {[
                  { t: 'Photo studio', e: '📷' },
                  { t: 'Affiche vintage', e: '🖼' },
                  { t: 'Calligraphie AR', e: '🖋' },
                  { t: 'Mockup produit', e: '📦' },
                  { t: 'Fond mariage', e: '💐' },
                  { t: 'Carte voeux', e: '🎉' },
                ].map(s => (
                  <div key={s.t} style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${A.border}`, fontSize: 11.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <span style={{ fontSize: 14 }}>{s.e}</span>{s.t}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${A.border}`, padding: 16, marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: A.muted, letterSpacing: 0.4, marginBottom: 10 }}>MODÈLE</div>
              <div style={{ padding: 10, background: A.bg, borderRadius: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 800 }}>OpenAI · GPT-image-1</div>
                <div style={{ fontSize: 10.5, color: A.muted, marginTop: 2 }}>Qualité haute · ~12s par image · $0.04/image</div>
              </div>
            </div>
          </div>

          {/* Right — results */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
              {[
                { c: 'linear-gradient(160deg,#fce7f3,#f9a8d4 40%,#fef3c7)', sel: true },
                { c: 'linear-gradient(160deg,#fef3c7,#fde68a 50%,#fbcfe8)' },
                { c: 'linear-gradient(160deg,#dbeafe,#a7f3d0 50%,#fef3c7)' },
                { c: 'linear-gradient(160deg,#fae8ff,#f5d0fe 60%,#fce7f3)' },
              ].map((g, i) => (
                <div key={i} style={{ aspectRatio: '3/4', borderRadius: 12, border: `2px solid ${g.sel ? A.purple : 'transparent'}`, background: g.c, position: 'relative', overflow: 'hidden', boxShadow: g.sel ? `0 0 0 4px ${A.purple}22` : 'none', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', inset: '40% 18% 40% 18%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, serif', fontSize: 22, fontWeight: 700, color: '#831843', textAlign: 'center' }}>إلى الأبد</div>
                  <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontFamily: 'Caveat, cursive', fontSize: 16, color: '#831843' }}>Yassmine &amp; Mohamed</div>
                  <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: 4 }}>#{i+1}</div>
                  {g.sel && <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 999, background: A.purple, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>✓</div>}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${A.border}`, background: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT }}>↻ 4 variantes de plus</button>
              <button style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${A.border}`, background: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT }}>✏ Affiner cette variante</button>
              <button style={{ flex: 2, height: 40, borderRadius: 10, border: 'none', background: A.success, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>↓ Télécharger HD · A3</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.AIStudio = AIStudio;
window.BeforeAfter = BeforeAfter;
window.AIGenerate = AIGenerate;
