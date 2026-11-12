import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card, Button } from '../components/Atoms';
import { COLORS, fmtTND } from '../lib/tokens';

const input: React.CSSProperties = { height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 };

// Page admin : ajouter / renommer / désactiver des services et des articles du catalogue (prix).
export function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [item, setItem] = useState({ name: '', serviceId: '', unitPrice: '', unit: 'unité' });
  const [error, setError] = useState<string | null>(null);

  const load = () => Promise.all([api.get('/services', { params: { all: 1 } }), api.get('/catalog', { params: { all: 1 } })])
    .then(([s, c]) => { setServices(s.data.services); setItems(c.data.items); });
  useEffect(() => { load(); }, []);

  const run = async (fn: () => Promise<any>) => {
    setError(null);
    try { await fn(); await load(); } catch (e: any) { setError(e.response?.data?.error ?? 'Erreur'); }
  };

  const addService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    run(async () => { await api.post('/services', { name, icon: icon || null }); setName(''); setIcon(''); });
  };
  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(item.unitPrice);
    if (!item.name.trim() || !item.serviceId || isNaN(price)) return setError('Nom, service et prix sont nécessaires pour un article.');
    run(async () => { await api.post('/catalog', { ...item, unitPrice: price }); setItem({ ...item, name: '', unitPrice: '' }); });
  };

  return (
    <div className="p-6">
      <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 14 }}>
        Ajoute les services proposés par le labo. Ils apparaissent tout de suite dans « Nouvelle commande ». Un service désactivé reste sur les anciennes commandes.
      </div>
      {error && <div style={{ color: COLORS.danger, fontSize: 13, marginBottom: 10 }}>{error}</div>}

      <Card style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Services</div>
        <form onSubmit={addService} className="flex gap-2 mb-4 flex-wrap">
          <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🎁" maxLength={4} style={{ ...input, width: 64, textAlign: 'center' }} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nouveau service (ex. Tirage grand format)" style={{ ...input, flex: 1, minWidth: 220 }} />
          <Button type="submit">+ Ajouter</Button>
        </form>
        {services.map((s) => (
          <div key={s.id} className="flex items-center gap-3" style={{ padding: '10px 0', borderTop: `1px solid ${COLORS.border}`, opacity: s.isActive ? 1 : 0.5 }}>
            <input defaultValue={s.icon ?? ''} maxLength={4} onBlur={(e) => e.target.value !== (s.icon ?? '') && run(() => api.patch(`/services/${s.id}`, { icon: e.target.value || null }))}
              style={{ ...input, width: 56, textAlign: 'center', height: 34 }} />
            <input defaultValue={s.name} onBlur={(e) => e.target.value.trim() && e.target.value !== s.name && run(() => api.patch(`/services/${s.id}`, { name: e.target.value }))}
              style={{ ...input, flex: 1, height: 34 }} />
            <div style={{ fontSize: 11, color: COLORS.muted, whiteSpace: 'nowrap' }}>{s._count?.orders ?? 0} commande(s)</div>
            <Button size="sm" variant="ghost" onClick={() => run(() => api.patch(`/services/${s.id}`, { isActive: !s.isActive }))}>{s.isActive ? 'Désactiver' : 'Réactiver'}</Button>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Catalogue de prix</div>
        <form onSubmit={addItem} className="flex gap-2 mb-4 flex-wrap">
          <input value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} placeholder="Article (ex. Tirage 30x45)" style={{ ...input, flex: 1, minWidth: 200 }} />
          <select value={item.serviceId} onChange={(e) => setItem({ ...item, serviceId: e.target.value })} style={input}>
            <option value="">Service…</option>
            {services.filter((s) => s.isActive).map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
          <input value={item.unitPrice} onChange={(e) => setItem({ ...item, unitPrice: e.target.value })} placeholder="Prix TND" type="number" step="0.001" style={{ ...input, width: 110 }} />
          <input value={item.unit} onChange={(e) => setItem({ ...item, unit: e.target.value })} placeholder="Unité" style={{ ...input, width: 100 }} />
          <Button type="submit">+ Ajouter</Button>
        </form>
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-3" style={{ padding: '8px 0', borderTop: `1px solid ${COLORS.border}`, fontSize: 13, opacity: i.isActive ? 1 : 0.5 }}>
            <div className="flex-1">{i.name}</div>
            <div style={{ color: COLORS.muted }}>{i.service?.icon} {i.service?.name}</div>
            <input defaultValue={i.unitPrice} type="number" step="0.001"
              onBlur={(e) => parseFloat(e.target.value) !== i.unitPrice && !isNaN(parseFloat(e.target.value)) && run(() => api.patch(`/catalog/${i.id}`, { unitPrice: parseFloat(e.target.value) }))}
              style={{ ...input, width: 100, height: 32 }} />
            <div style={{ color: COLORS.muted, width: 70 }}>/ {i.unit}</div>
            <Button size="sm" variant="ghost" onClick={() => run(() => api.patch(`/catalog/${i.id}`, { isActive: !i.isActive }))}>{i.isActive ? 'Retirer' : 'Remettre'}</Button>
          </div>
        ))}
        {items.length === 0 && <div style={{ color: COLORS.muted, fontSize: 13 }}>Aucun article. {fmtTND(0) && ''}</div>}
      </Card>
    </div>
  );
}
