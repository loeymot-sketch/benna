// EL BENNA LAB OS — Final additions
// 1) WhatsApp client notify flow
// 2) Admin team management (add/remove member)
// 3) Onboarding nouvel employé (1ère connexion)
// 4) Déclarer absence
// 5) Empty states
// 6) Page client publique avec QR + WhatsApp share

const F = {
  bg: '#f5f5f7', panel: '#fff', text: '#0f172a', muted: '#64748b',
  mutedSoft: '#94a3b8', border: '#e5e7eb', primary: '#1e3a8a',
  primaryDark: '#0a1f4d', accent: '#dc2626', success: '#16a34a',
  warning: '#f59e0b', whatsapp: '#25d366',
};

// ────────── WhatsApp notify modal (desktop) ──────────
const WANotifyModal = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'rgba(15,23,42,0.55)', fontFamily: FONT, color: F.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 720, background: '#fff', borderRadius: 16, boxShadow: '0 30px 80px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${F.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 10, background: F.whatsapp + '14', color: F.whatsapp, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>💬</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: F.muted, letterSpacing: 0.5 }}>NOTIFICATION CLIENT · WHATSAPP</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 1 }}>Prévenir Abdelwahab Khelifi</div>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: F.bg, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>

        <div style={{ padding: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Left : context */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: F.muted, letterSpacing: 0.4, marginBottom: 8 }}>COMMANDE</div>
            <div style={{ background: F.bg, borderRadius: 10, padding: 12, marginBottom: 14 }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: F.primary, fontWeight: 700 }}>LB-202605-0042</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>50 cartes visite carton 250g</div>
              <div style={{ fontSize: 11.5, color: F.muted, marginTop: 4 }}>Statut : <b style={{ color: F.success }}>● PRÊTE</b> · finalisée à 16:42</div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: F.muted, letterSpacing: 0.4, marginBottom: 8 }}>CLIENT</div>
            <div style={{ background: F.bg, borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 999, background: F.primary, color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>AK</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Abdelwahab Khelifi</div>
                <div style={{ fontSize: 11.5, color: F.muted, fontFamily: 'ui-monospace,Menlo,monospace' }}>+216 22 345 678</div>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: F.success, background: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>WA OK</span>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: F.muted, letterSpacing: 0.4, margin: '14px 0 8px' }}>OPTIONS</div>
            {[
              { t: 'Joindre le QR de suivi', d: 'Le client peut suivre le statut', on: true },
              { t: 'Envoyer en français', d: 'AR disponible aussi', on: true },
              { t: 'Envoi automatique', d: '⚙️ admin global', on: false, lock: true },
            ].map(o => (
              <div key={o.t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: `1px solid ${F.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{o.t}</div>
                  <div style={{ fontSize: 10.5, color: F.muted }}>{o.d}</div>
                </div>
                <div style={{ width: 36, height: 22, borderRadius: 999, background: o.on ? F.success : F.border, position: 'relative', opacity: o.lock ? 0.5 : 1 }}>
                  <span style={{ position: 'absolute', top: 2, [o.on ? 'right' : 'left']: 2, width: 18, height: 18, borderRadius: 999, background: '#fff' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Right : message preview */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: F.muted, letterSpacing: 0.4, marginBottom: 8 }}>APERÇU DU MESSAGE</div>
            <div style={{ background: '#e5ddd5', borderRadius: 12, padding: 16, minHeight: 280, position: 'relative', backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
              <div style={{ background: '#fff', borderRadius: '12px 12px 12px 0', padding: '10px 12px 8px', maxWidth: '90%', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)', fontSize: 13, lineHeight: 1.45, color: '#111' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: F.primary, marginBottom: 4 }}>EL BENNA · Labo Photo</div>
                Bonjour <b>M. Khelifi</b> 👋<br/>
                Votre commande est <b>prête à retirer</b> ✅<br/><br/>
                📦 <b>50 cartes visite carton 250g</b><br/>
                🆔 N° LB-202605-0042<br/>
                📍 Boutique 1 · Av. Bourguiba<br/>
                🕐 Ouvert jusqu'à 19h<br/><br/>
                Suivre votre commande :<br/>
                <span style={{ color: '#039be5' }}>elbenna.tn/t/AK4242</span><br/><br/>
                Merci de votre confiance 🙏
                <div style={{ fontSize: 9.5, color: '#7a7a7a', textAlign: 'right', marginTop: 4 }}>16:43 ✓✓</div>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: 10, background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, fontSize: 11, color: '#854d0e', lineHeight: 1.5 }}>
              💡 Le client recevra ce message sur WhatsApp. S'il n'a pas WA, il recevra un SMS équivalent (sans emoji).
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${F.border}`, background: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT }}>Modifier le message</button>
              <button style={{ flex: 2, height: 42, borderRadius: 10, border: 'none', background: F.whatsapp, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: `0 4px 14px ${F.whatsapp}55` }}>💬 Envoyer sur WhatsApp</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ────────── Validation "PRÊTE" → propose notify ──────────
const ReadyConfirm = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'rgba(15,23,42,0.5)', fontFamily: FONT, color: F.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 460, background: '#fff', borderRadius: 16, padding: 28, textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ width: 80, height: 80, borderRadius: 999, background: F.success + '14', color: F.success, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 38 }}>✓</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: F.success, letterSpacing: 0.5 }}>COMMANDE PRÊTE</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Bien joué Mehdi 🎉</div>
        <div style={{ fontSize: 13, color: F.muted, marginTop: 6, lineHeight: 1.5 }}>
          La commande <b>LB-…0042</b> est marquée comme prête.<br/>
          Veux-tu prévenir le client maintenant ?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
          <button style={{ height: 50, borderRadius: 10, border: 'none', background: F.whatsapp, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 14px ${F.whatsapp}55` }}>
            💬 Envoyer WhatsApp à M. Khelifi
          </button>
          <button style={{ height: 42, borderRadius: 10, border: `1px solid ${F.border}`, background: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', fontFamily: FONT, color: F.text }}>
            Plus tard / le client passe en personne
          </button>
        </div>
        <div style={{ fontSize: 10.5, color: F.muted, marginTop: 14 }}>
          ⚙️ Adel a activé l'<b>envoi auto</b> pour ce type de produit — pas besoin de cliquer la prochaine fois.
        </div>
      </div>
    </div>
  );
};

// ────────── Page client publique (QR scanné) ──────────
const ClientTracking = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: F.bg, fontFamily: FONT, color: F.text, paddingTop: 54, overflow: 'hidden', position: 'relative' }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, ${F.primaryDark}, ${F.primary})`, color: '#fff', padding: '20px 22px 24px' }}>
        <Logo size={26} invert withText={false} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 14, fontWeight: 600, letterSpacing: 0.4 }}>SUIVI DE COMMANDE</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>Bonjour M. Khelifi 👋</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontFamily: 'ui-monospace,Menlo,monospace' }}>LB-202605-0042</div>
      </div>

      {/* Big status */}
      <div style={{ margin: '-14px 16px 0', padding: 20, background: '#fff', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, background: F.success, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 36, color: '#fff', boxShadow: `0 0 0 6px ${F.success}22, 0 0 0 14px ${F.success}11` }}>✓</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: F.success, letterSpacing: 0.5 }}>● VOTRE COMMANDE EST PRÊTE</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>50 cartes visite carton 250g</div>
        <div style={{ fontSize: 12, color: F.muted, marginTop: 8, lineHeight: 1.5 }}>
          📍 <b>Boutique 1 · Av. Bourguiba</b><br/>
          🕐 Ouvert aujourd'hui jusqu'à 19h
        </div>
        <button style={{ marginTop: 14, width: '100%', height: 46, borderRadius: 12, border: 'none', background: F.whatsapp, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          💬 Nous contacter sur WhatsApp
        </button>
      </div>

      {/* Timeline */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: F.muted, letterSpacing: 0.4, marginBottom: 12 }}>HISTORIQUE</div>
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 2, background: F.border, borderRadius: 999 }} />
          {[
            { t: 'Commande prête à retirer', d: 'Aujourd\'hui · 16:42', done: true, last: false },
            { t: 'En production', d: 'Aujourd\'hui · 14:38', done: true },
            { t: 'Maquette validée par vous', d: 'Aujourd\'hui · 11:20', done: true },
            { t: 'Maquette envoyée', d: 'Aujourd\'hui · 09:45', done: true },
            { t: 'Commande reçue', d: 'Hier · 17:10', done: true },
          ].map((s, i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
              <div style={{ position: 'absolute', left: -25, top: 4, width: 16, height: 16, borderRadius: 999, background: i === 0 ? F.success : F.border, border: i === 0 ? `3px solid ${F.success}55` : 'none', boxSizing: 'content-box' }} />
              <div style={{ fontSize: 13, fontWeight: i === 0 ? 800 : 600, color: i === 0 ? F.success : F.text }}>{s.t}</div>
              <div style={{ fontSize: 11, color: F.muted, marginTop: 1 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 14, border: `1px solid ${F.border}`, fontSize: 11.5, color: F.muted, lineHeight: 1.5 }}>
          ℹ️ Page accessible avec le <b>QR</b> de votre reçu, ou via le lien WhatsApp envoyé. Aucune connexion requise — vos infos restent privées.
        </div>
      </div>
    </div>
  );
};

// ────────── Admin : gérer l'équipe ──────────
const TeamManagement = () => {
  const team = [
    { i: 'AD', n: 'Adel Bennani', r: 'Admin', c: 'linear-gradient(135deg,#f59e0b,#dc2626)', shop: 'B1+B2', status: 'active', admin: true },
    { i: 'KA', n: 'Karim Maâlej', r: 'Designer senior', c: '#a855f7', shop: 'B1', status: 'active' },
    { i: 'IM', n: 'Imen Trabelsi', r: 'Designer', c: '#ec4899', shop: 'B1', status: 'pending', new: true },
    { i: 'SO', n: 'Sonia Ben Ali', r: 'Réception', c: '#3b82f6', shop: 'B1', status: 'active' },
    { i: 'YO', n: 'Yosra Sassi', r: 'Réception', c: '#14b8a6', shop: 'B2', status: 'active' },
    { i: 'SA', n: 'Salma Kaddour', r: 'Réception', c: '#f97316', shop: 'B2', status: 'active' },
    { i: 'ME', n: 'Mehdi Hamrouni', r: 'Imprimeur senior', c: '#f97316', shop: 'B1', status: 'active' },
    { i: 'MO', n: 'Mohamed Riahi', r: 'Imprimeur', c: '#0ea5e9', shop: 'B2', status: 'active' },
    { i: 'SE', n: 'Salem Jouini', r: 'Imprimeur', c: '#dc2626', shop: 'B2', status: 'active' },
    { i: 'AL', n: 'Ali Belhaj', r: 'Imprimeur (remplacant)', c: '#64748b', shop: 'B1', status: 'inactive' },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', background: F.bg, fontFamily: FONT, color: F.text }}>
      <Sidebar active="settings" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="👥 Gérer l'équipe" subtitle="9 membres actifs · 1 en attente · 1 désactivé" right={
          <button style={{ height: 38, padding: '0 14px', borderRadius: 8, border: 'none', background: F.accent, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 2px 8px ${F.accent}33` }}>
            <Icon name="plus" size={14} /> Ajouter un membre
          </button>
        } />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['Tous · 11', 'Actifs · 9', 'En attente · 1', 'Désactivés · 1', 'Designers · 2', 'Imprimeurs · 4', 'Réception · 3'].map((t, i) => (
              <div key={t} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: i === 0 ? F.primary : '#fff', color: i === 0 ? '#fff' : F.text, border: `1px solid ${i === 0 ? F.primary : F.border}`, cursor: 'pointer' }}>{t}</div>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${F.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1.6fr 1.2fr 1fr 0.8fr 1.2fr 90px', gap: 0, padding: '12px 16px', background: F.bg, fontSize: 10.5, fontWeight: 800, color: F.muted, letterSpacing: 0.4, borderBottom: `1px solid ${F.border}` }}>
              <div></div><div>NOM</div><div>RÔLE</div><div>BOUTIQUE</div><div>PIN</div><div>STATUT</div><div></div>
            </div>
            {team.map((u, i) => (
              <div key={u.i} style={{ display: 'grid', gridTemplateColumns: '50px 1.6fr 1.2fr 1fr 0.8fr 1.2fr 90px', gap: 0, padding: '12px 16px', borderTop: i ? `1px solid ${F.border}` : 'none', alignItems: 'center', background: u.new ? '#fefce8' : '#fff' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: u.c, color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: u.status === 'inactive' ? 0.4 : 1 }}>{u.i}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {u.n}
                    {u.admin && <span style={{ fontSize: 9, fontWeight: 800, color: '#854d0e', background: '#fde68a', padding: '1px 5px', borderRadius: 3, letterSpacing: 0.5 }}>★ ADMIN</span>}
                    {u.new && <span style={{ fontSize: 9, fontWeight: 800, color: '#854d0e', background: '#fde68a', padding: '1px 5px', borderRadius: 3 }}>NOUVEAU</span>}
                  </div>
                  <div style={{ fontSize: 10.5, color: F.muted }}>elbenna.tn/{u.i.toLowerCase()}</div>
                </div>
                <div style={{ fontSize: 12 }}>{u.r}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{u.shop}</div>
                <div style={{ fontSize: 10.5, color: F.primary, fontWeight: 700, fontFamily: 'ui-monospace,Menlo,monospace' }}>●●●●●● {u.new && <span style={{ color: F.warning, fontWeight: 700, fontFamily: FONT, marginLeft: 4 }}>(à définir)</span>}</div>
                <div>
                  {u.status === 'active' && <span style={{ fontSize: 10.5, fontWeight: 800, color: F.success, background: '#dcfce7', padding: '3px 8px', borderRadius: 4 }}>● ACTIF</span>}
                  {u.status === 'pending' && <span style={{ fontSize: 10.5, fontWeight: 800, color: F.warning, background: '#fef3c7', padding: '3px 8px', borderRadius: 4 }}>● EN ATTENTE</span>}
                  {u.status === 'inactive' && <span style={{ fontSize: 10.5, fontWeight: 800, color: F.muted, background: F.bg, padding: '3px 8px', borderRadius: 4 }}>○ DÉSACTIVÉ</span>}
                </div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${F.border}`, background: '#fff', cursor: 'pointer', fontSize: 12 }}>✎</button>
                  <button style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${F.border}`, background: '#fff', cursor: 'pointer', fontSize: 12 }}>⋯</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: 14, background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, fontSize: 12, color: '#854d0e', lineHeight: 1.5 }}>
            🔐 <b>Sécurité</b> : seul Adel peut ajouter / supprimer / réinitialiser les PINs. Pour ne pas être bloqué, désigne un <b>admin secondaire</b> dans Paramètres → Sécurité.
          </div>
        </div>
      </div>
    </div>
  );
};

// ────────── Add member modal ──────────
const AddMember = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'rgba(15,23,42,0.5)', fontFamily: FONT, color: F.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 560, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${F.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: F.muted, letterSpacing: 0.5 }}>NOUVEAU MEMBRE · ÉTAPE 1/2</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>Ajouter Imen Trabelsi</div>
        </div>
        <div style={{ padding: 22 }}>
          {[
            { l: 'Nom complet *', v: 'Imen Trabelsi' },
            { l: 'Rôle *', v: 'Designer', select: true },
            { l: 'Boutique principale *', v: 'Boutique 1 · Bourguiba', select: true },
            { l: 'Téléphone (pour PIN par SMS)', v: '+216 22 111 222' },
          ].map(f => (
            <div key={f.l} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: F.muted, display: 'block', marginBottom: 4 }}>{f.l}</label>
              <div style={{ height: 38, padding: '0 12px', background: '#fff', border: `1px solid ${F.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
                {f.v} {f.select && <span style={{ flex: 1, textAlign: 'right', color: F.muted, fontSize: 10 }}>▾</span>}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 14, padding: 12, background: F.bg, borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: F.muted, letterSpacing: 0.4, marginBottom: 8 }}>PERMISSIONS</div>
            {[
              { t: 'Voir toutes les commandes', on: true, locked: false },
              { t: 'Modifier maquettes', on: true, locked: false },
              { t: 'Avancer statut commande', on: true, locked: false },
              { t: 'Notifier client (WhatsApp)', on: false, locked: false },
              { t: 'Voir l\'équipe (annuaire)', on: true, locked: false },
              { t: 'Gérer l\'équipe', on: false, locked: true, msg: 'Admin uniquement' },
            ].map(p => (
              <div key={p.t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{ flex: 1, fontSize: 12, color: p.locked ? F.mutedSoft : F.text }}>
                  {p.t} {p.locked && <span style={{ fontSize: 9.5, color: F.muted, marginLeft: 4 }}>🔒 {p.msg}</span>}
                </div>
                <div style={{ width: 32, height: 20, borderRadius: 999, background: p.on ? F.success : F.border, position: 'relative', opacity: p.locked ? 0.5 : 1 }}>
                  <span style={{ position: 'absolute', top: 2, [p.on ? 'right' : 'left']: 2, width: 16, height: 16, borderRadius: 999, background: '#fff' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${F.border}`, background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Annuler</button>
            <button style={{ flex: 2, height: 42, borderRadius: 10, border: 'none', background: F.primary, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Créer le compte → Générer PIN</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ────────── PIN initial / onboarding ──────────
const FirstLogin = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: `linear-gradient(180deg, ${F.primaryDark}, ${F.primary})`, color: '#fff', fontFamily: FONT, padding: '70px 32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
      <div style={{ width: 80, height: 80, borderRadius: 999, background: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>IM</div>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#fde68a', marginTop: 12, letterSpacing: 0.5 }}>★ BIENVENUE CHEZ EL BENNA</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>Bonjour Imen 👋</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6, lineHeight: 1.5 }}>
        Adel t'a créé un compte.<br/>Tu vas définir ton <b>code PIN à 6 chiffres</b> — celui que tu utiliseras à chaque connexion.
      </div>

      <div style={{ marginTop: 28, marginBottom: 14, fontSize: 13, fontWeight: 700, opacity: 0.85 }}>Choisis ton code</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        {[1,1,1,0,0,0].map((f, i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: 999, background: f ? '#fff' : 'transparent', border: '2px solid rgba(255,255,255,0.35)' }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: 240 }}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
          <div key={i} style={{ height: 56, borderRadius: 999, background: k ? 'rgba(255,255,255,0.12)' : 'transparent', backdropFilter: k ? 'blur(20px)' : 'none', border: k ? '1px solid rgba(255,255,255,0.15)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{k}</div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 50, left: 24, right: 24, fontSize: 10.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
        ⚠️ Ton code reste secret. Personne ne peut le voir, pas même Adel. Il peut juste le réinitialiser si tu l'oublies.
      </div>
    </div>
  );
};

// ────────── Empty state — Carnet vide ──────────
const EmptyCarnet = () => {
  return (
    <div style={{ display: 'flex', height: '100%', background: F.bg, fontFamily: FONT, color: F.text }}>
      <Sidebar active="carnet" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar title="📓 Le Carnet" subtitle="Aucun item — tout est sous contrôle" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ textAlign: 'center', maxWidth: 460 }}>
            <div style={{ fontSize: 80, marginBottom: 14 }}>🌟</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Aucun message en cours</div>
            <div style={{ fontSize: 14, color: F.muted, marginTop: 8, lineHeight: 1.6 }}>
              Toute l'équipe est à jour. Pas de passation en attente, pas d'alerte ouverte, pas de question sans réponse.
            </div>
            <button style={{ marginTop: 22, height: 46, padding: '0 20px', borderRadius: 10, border: 'none', background: F.accent, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: FONT, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 14px ${F.accent}44` }}>
              <Icon name="plus" size={15} /> Démarrer un nouveau post
            </button>
            <div style={{ marginTop: 26, padding: 16, background: '#fff', border: `1px solid ${F.border}`, borderRadius: 12, textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: F.muted, letterSpacing: 0.4, marginBottom: 8 }}>QUELQUES IDÉES POUR DÉMARRER</div>
              {[
                { e: '🔄', t: 'Passer un travail à un collègue' },
                { e: '✅', t: 'Créer une tâche à faire avant ce soir' },
                { e: '❓', t: 'Poser une question à l\'équipe' },
                { e: '📢', t: 'Faire une annonce à toute la boutique' },
              ].map(x => (
                <div key={x.t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 12.5 }}>
                  <span style={{ fontSize: 16 }}>{x.e}</span>{x.t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ────────── Déclarer absence ──────────
const DeclareAbsence = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'rgba(15,23,42,0.5)', fontFamily: FONT, color: F.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 560, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${F.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🌴</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: F.muted, letterSpacing: 0.5 }}>DÉCLARER UNE ABSENCE</div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Karim · Designer</div>
          </div>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: F.muted, display: 'block', marginBottom: 4 }}>Du *</label>
              <div style={{ height: 38, padding: '0 12px', background: '#fff', border: `1px solid ${F.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>22 mai 2026</div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: F.muted, display: 'block', marginBottom: 4 }}>Au *</label>
              <div style={{ height: 38, padding: '0 12px', background: '#fff', border: `1px solid ${F.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>25 mai 2026</div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: F.muted, display: 'block', marginBottom: 4 }}>Motif</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { t: 'Congé', c: '#14b8a6', on: true }, { t: 'Maladie', c: '#dc2626' },
                { t: 'Formation', c: '#a855f7' }, { t: 'Personnel', c: '#64748b' },
              ].map(m => (
                <div key={m.t} style={{ flex: 1, height: 36, borderRadius: 8, background: m.on ? m.c + '14' : '#fff', color: m.on ? m.c : F.text, border: `1px solid ${m.on ? m.c : F.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{m.t}</div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: F.muted, display: 'block', marginBottom: 4 }}>Remplaçant suggéré</label>
            <div style={{ height: 38, padding: '0 12px', background: F.primary + '0d', border: `1px solid ${F.primary}33`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, background: '#ec4899', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>IM</span>
              Imen Trabelsi · Designer
              <span style={{ flex: 1, textAlign: 'right', fontSize: 10, color: F.primary }}>← changer</span>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: F.muted, display: 'block', marginBottom: 4 }}>Note de passation</label>
            <div style={{ minHeight: 64, padding: 10, background: '#fff', border: `1px solid ${F.border}`, borderRadius: 8, fontSize: 12.5, lineHeight: 1.5 }}>
              Imen, tu prends mes commandes en cours. La maquette de Resto Dar Yassmine est en attente de retour client, à relancer mardi. Le reste est dans Pour Moi.
            </div>
          </div>

          <div style={{ padding: 12, background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, fontSize: 11.5, color: '#854d0e', lineHeight: 1.5 }}>
            ℹ️ Tes <b>3 commandes en cours</b> seront automatiquement réassignées à Imen pendant ton absence. Un post Carnet sera généré pour la prévenir.
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${F.border}`, background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Annuler</button>
            <button style={{ flex: 2, height: 42, borderRadius: 10, border: 'none', background: F.primary, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: FONT }}>Déclarer & prévenir l'équipe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

window.WANotifyModal = WANotifyModal;
window.ReadyConfirm = ReadyConfirm;
window.ClientTracking = ClientTracking;
window.TeamManagement = TeamManagement;
window.AddMember = AddMember;
window.FirstLogin = FirstLogin;
window.EmptyCarnet = EmptyCarnet;
window.DeclareAbsence = DeclareAbsence;
