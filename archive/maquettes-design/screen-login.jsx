// EL BENNA LAB OS — Login screen with PIN keypad

const LoginScreen = () => {
  const [pin, setPin] = React.useState('••••');
  const users = [
    { name: 'Adel', role: 'Admin', initials: 'AD', color: 'linear-gradient(135deg,#f59e0b,#dc2626)' },
    { name: 'Sonia', role: 'Réception', initials: 'SO', color: 'linear-gradient(135deg,#3b82f6,#1e3a8a)' },
    { name: 'Karim', role: 'Designer', initials: 'KA', color: 'linear-gradient(135deg,#a855f7,#6d28d9)' },
    { name: 'Mehdi', role: 'Production', initials: 'ME', color: 'linear-gradient(135deg,#f97316,#dc2626)' },
    { name: 'Yosra', role: 'Réception', initials: 'YO', color: 'linear-gradient(135deg,#14b8a6,#0f766e)' },
    { name: 'Nizar', role: 'Photographe', initials: 'NI', color: 'linear-gradient(135deg,#84cc16,#16a34a)' },
  ];

  const Key = ({ label, sub, action }) => (
    <button style={{
      width: 80, height: 80, borderRadius: 16,
      border: `1px solid ${COLORS.border}`, background: '#fff',
      fontSize: 28, fontWeight: 600, color: COLORS.text,
      cursor: 'pointer', fontFamily: FONT,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      transition: 'transform .08s',
    }}>
      {action === 'back' ? <Icon name="backspace" size={22} color={COLORS.muted} /> :
       action === 'clear' ? <Icon name="x" size={22} color={COLORS.muted} /> :
       <>
         <span>{label}</span>
         {sub && <span style={{ fontSize: 9, color: COLORS.muted, fontWeight: 500, letterSpacing: 1 }}>{sub}</span>}
       </>}
    </button>
  );

  return (
    <div style={{
      width: '100%', height: '100%', background: COLORS.bg,
      display: 'flex', fontFamily: FONT, color: COLORS.text,
      backgroundImage: `radial-gradient(circle at 20% 0%, ${COLORS.primary}0d, transparent 50%), radial-gradient(circle at 80% 100%, ${COLORS.accent}0d, transparent 50%)`,
    }}>
      {/* Left: user grid */}
      <div style={{ flex: 1, padding: '40px 48px', display: 'flex', flexDirection: 'column' }}>
        <Logo size={36} />
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>Bonjour 👋</div>
          <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Sélectionnez votre profil pour vous connecter</div>
        </div>
        <div style={{
          marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, flex: 1, alignContent: 'start',
        }}>
          {users.map((u, i) => (
            <div key={u.name} style={{
              padding: 16, borderRadius: 14,
              background: i === 1 ? COLORS.panel : COLORS.panel,
              border: i === 1 ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
              cursor: 'pointer',
              boxShadow: i === 1 ? `0 4px 16px ${COLORS.primary}22` : '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex', alignItems: 'center', gap: 12,
              position: 'relative',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: u.color,
                color: '#fff', fontWeight: 700, fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{u.initials}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 11.5, color: COLORS.muted }}>{u.role}</div>
              </div>
              {i === 1 && <span style={{
                position: 'absolute', top: 10, right: 10, width: 8, height: 8,
                borderRadius: 999, background: COLORS.success,
              }} />}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: COLORS.mutedSoft, marginTop: 20 }}>
          v1.0 · Boutique 1 — 66 Av. Habib Bourguiba · Houmet Souk
        </div>
      </div>
      {/* Right: PIN pad */}
      <div style={{
        flex: '0 0 440px', background: COLORS.panel,
        borderLeft: `1px solid ${COLORS.border}`,
        padding: '40px 48px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'linear-gradient(135deg,#3b82f6,#1e3a8a)',
          color: '#fff', fontWeight: 700, fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>SO</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Sonia</div>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 20 }}>Réceptionniste · Boutique 1</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: 999,
              background: i < 3 ? COLORS.primary : COLORS.bg,
              border: i === 3 ? `2px solid ${COLORS.borderStrong}` : 'none',
              boxShadow: i < 3 ? `0 0 0 3px ${COLORS.primary}22` : 'none',
              transition: 'all .15s',
            }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 12 }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <Key key={n} label={n} sub={['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'][n-1]} />
          ))}
          <Key action="clear" />
          <Key label={0} />
          <Key action="back" />
        </div>
        <div style={{ marginTop: 24, fontSize: 12, color: COLORS.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="qr" size={14} /> Ou scannez votre badge
        </div>
      </div>
    </div>
  );
};

window.LoginScreen = LoginScreen;
