import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card, Avatar, Button } from '../components/Atoms';
import { COLORS, ROLE_LABELS } from '../lib/tokens';

export function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => api.get('/admin/users').then((r) => setUsers(r.data.users));
  useEffect(() => {
    load();
    api.get('/shops').then((r) => setShops(r.data.shops));
  }, []);

  const [pinModal, setPinModal] = useState<{ user: any } | null>(null);

  const resetPin = async (id: string) => {
    if (!confirm('Réinitialiser le PIN ? Le membre devra en choisir un nouveau à sa prochaine connexion.')) return;
    await api.post(`/admin/users/${id}/reset-pin`);
    load();
  };

  const toggle = async (id: string) => {
    try {
      await api.post(`/admin/users/${id}/toggle`);
    } catch (e: any) {
      const code = e.response?.data?.error;
      alert(code === 'cannot_disable_self' ? 'Tu ne peux pas désactiver ton propre compte.'
        : code === 'last_admin' ? 'Impossible : il doit rester au moins un admin actif.' : 'Erreur.');
    }
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 13, color: COLORS.muted }}>{users.filter((u) => u.isActive).length} actif(s) · {users.length} au total</div>
        <Button onClick={() => setShowAdd(true)}>+ Ajouter un membre</Button>
      </div>

      {showAdd && <AddMemberModal shops={shops} onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); load(); }} />}
      {pinModal && <SetPinModal user={pinModal.user} onClose={() => setPinModal(null)} onDone={() => { setPinModal(null); load(); }} />}

      <Card>
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead style={{ background: COLORS.bg }}>
            <tr>
              {['Membre', 'Rôle', 'Boutique', 'PIN', 'Statut', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.3, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: 12 }}>
                  <div className="flex items-center gap-2.5">
                    <Avatar firstName={u.firstName} lastName={u.lastName} size={28} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: 12 }}>{ROLE_LABELS[u.role] ?? u.role}</td>
                <td style={{ padding: 12, color: COLORS.muted }}>{u.shop?.name ?? '—'}</td>
                <td style={{ padding: 12 }}>
                  {u.pinSet && u.mustChangePin
                    ? <span className="pill" title="Code temporaire remis : l'employé doit le changer à sa 1ère connexion" style={{ background: COLORS.warning + '1a', color: COLORS.warning, border: `1px solid ${COLORS.warning}33` }}>temporaire</span>
                    : u.pinSet
                    ? <span className="pill" style={{ background: COLORS.success + '1a', color: COLORS.success, border: `1px solid ${COLORS.success}33` }}>personnel</span>
                    : <span className="pill" style={{ background: COLORS.warning + '1a', color: COLORS.warning, border: `1px solid ${COLORS.warning}33` }}>à créer</span>}
                </td>
                <td style={{ padding: 12 }}>
                  {u.isActive
                    ? <span className="pill" style={{ background: COLORS.success + '1a', color: COLORS.success, border: `1px solid ${COLORS.success}33` }}>actif</span>
                    : <span className="pill" style={{ background: COLORS.muted + '1a', color: COLORS.muted, border: `1px solid ${COLORS.muted}33` }}>désactivé</span>}
                </td>
                <td style={{ padding: 12 }}>
                  <Button size="sm" variant="secondary" onClick={() => setPinModal({ user: u })}>Modifier PIN</Button>{' '}
                  <Button size="sm" variant="ghost" onClick={() => resetPin(u.id)}>Réinitialiser</Button>{' '}
                  <Button size="sm" variant="ghost" onClick={() => toggle(u.id)}>{u.isActive ? 'Désactiver' : 'Activer'}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function SetPinModal({ user, onClose, onDone }: { user: any; onClose: () => void; onDone: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const expected = user.role === 'ADMIN' ? 6 : 4;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pin.length !== expected) return setError(`Le PIN doit avoir ${expected} chiffres.`);
    try {
      await api.post(`/admin/users/${user.id}/set-pin`, { pin });
      onDone();
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Erreur');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 100 }}>
      <Card style={{ padding: 24, width: 420 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Définir un PIN pour {user.firstName}</div>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 18 }}>
          {user.role === 'ADMIN' ? '6 chiffres (admin)' : '4 chiffres'} · le membre devra choisir son propre code à sa prochaine connexion.
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password" inputMode="numeric" pattern="\d*" autoFocus
            maxLength={expected} value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder={'•'.repeat(expected)}
            style={{
              height: 56, padding: '0 16px', borderRadius: 10,
              border: `1px solid ${COLORS.border}`, fontSize: 24, letterSpacing: 8,
              textAlign: 'center', fontFamily: 'ui-monospace,Menlo,monospace',
            }}
            required
          />
          {error && <div style={{ color: COLORS.danger, fontSize: 12 }}>{error}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function AddMemberModal({ shops, onClose, onCreated }: { shops: any[]; onClose: () => void; onCreated: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('RECEPTION');
  const [shopId, setShopId] = useState(shops[0]?.id ?? '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/users', { firstName, lastName, role, shopId });
    onCreated();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 100 }}>
      <Card style={{ padding: 24, width: 480 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Ajouter un membre</div>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 18 }}>Le membre choisira lui-même son PIN à la 1ère connexion.</div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
              style={{ height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
            <input placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required
              style={{ height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }} />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            style={{ height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }}
          >
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Responsable</option>
            <option value="RECEPTION">Réception</option>
            <option value="DESIGNER">Designer</option>
            <option value="PRODUCTION">Production</option>
            <option value="PHOTOGRAPHER">Photographe</option>
          </select>
          <select value={shopId} onChange={(e) => setShopId(e.target.value)}
            style={{ height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }}
          >
            {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
