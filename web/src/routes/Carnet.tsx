import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, PostTypeChip, Avatar, Button } from '../components/Atoms';
import { COLORS, POST_TYPE_META, timeAgo, fmtDateTime } from '../lib/tokens';
import { useAuth } from '../store/auth';
import { getSocket } from '../lib/socket';

export function CarnetLayout() {
  return (
    <div>
      <div className="flex gap-1 px-6 pt-4" style={{ borderBottom: `1px solid ${COLORS.border}`, background: COLORS.panel }}>
        <CarnetTab to="/carnet" label="Mur" exact />
        <CarnetTab to="/carnet/inbox" label="Pour Moi" />
        <CarnetTab to="/carnet/new" label="+ Nouveau post" accent />
      </div>
      <Outlet />
    </div>
  );
}

function CarnetTab({ to, label, exact, accent }: { to: string; label: string; exact?: boolean; accent?: boolean }) {
  return (
    <NavLink
      to={to} end={exact}
      className={({ isActive }) => ''}
      style={({ isActive }) => ({
        padding: '10px 14px', fontSize: 13, fontWeight: isActive ? 700 : 500,
        color: accent ? COLORS.accent : (isActive ? COLORS.primary : COLORS.muted),
        background: 'transparent', border: 'none', cursor: 'pointer',
        borderBottom: isActive ? `2px solid ${COLORS.primary}` : '2px solid transparent',
        marginBottom: -1, textDecoration: 'none',
      })}
    >
      {label}
    </NavLink>
  );
}

export function CarnetWall() {
  const [feed, setFeed] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');
  const navigate = useNavigate();

  const load = () => api.get('/posts/feed', { params: { type: filter || undefined } }).then((r) => setFeed(r.data.posts));
  useEffect(() => { load(); }, [filter]);
  useEffect(() => {
    const sock = getSocket();
    // `filter` en dépendance : sinon le rafraîchissement temps réel rechargerait l'ancien filtre.
    sock.on('post.created', load);
    sock.on('post.resolved', load);
    sock.on('post.replied', load);
    return () => { sock.off('post.created', load); sock.off('post.resolved', load); sock.off('post.replied', load); };
  }, [filter]);

  const pinned = feed.filter((p) => p.pinnedUntil && new Date(p.pinnedUntil) > new Date());
  const alerts = feed.filter((p) => p.type === 'ALERT' && p.status !== 'RESOLVED');
  const absences = feed.filter((p) => p.type === 'ABSENCE_NOTE');
  const others = feed.filter((p) => !pinned.includes(p) && !alerts.includes(p) && !absences.includes(p));

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { v: '', label: 'Tout' },
          { v: 'HANDOFF', label: '🔄 Passations' },
          { v: 'TASK', label: '✅ Tâches' },
          { v: 'QUESTION', label: '❓ Questions' },
          { v: 'ANNOUNCEMENT', label: '📢 Annonces' },
          { v: 'ALERT', label: '⚠️ Alertes' },
        ].map((f) => (
          <button
            key={f.v} onClick={() => setFilter(f.v)}
            style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: filter === f.v ? COLORS.primary : '#fff',
              color: filter === f.v ? '#fff' : COLORS.text,
              border: `1px solid ${filter === f.v ? COLORS.primary : COLORS.border}`,
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {pinned.length > 0 && (
        <Section title="📌 ÉPINGLÉS">
          {pinned.map((p) => <PostCard key={p.id} post={p} onClick={() => navigate(`/carnet/post/${p.id}`)} />)}
        </Section>
      )}

      {alerts.length > 0 && (
        <Section title="⚠️ ALERTES OUVERTES">
          {alerts.map((p) => <PostCard key={p.id} post={p} onClick={() => navigate(`/carnet/post/${p.id}`)} />)}
        </Section>
      )}

      {absences.length > 0 && (
        <Section title="🌴 ABSENCES">
          {absences.map((p) => <PostCard key={p.id} post={p} onClick={() => navigate(`/carnet/post/${p.id}`)} />)}
        </Section>
      )}

      <Section title="🔄 FLUX RÉCENT">
        {others.length === 0 && <div style={{ color: COLORS.muted, fontSize: 13, padding: 16 }}>Aucun post.</div>}
        {others.map((p) => <PostCard key={p.id} post={p} onClick={() => navigate(`/carnet/post/${p.id}`)} />)}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginBottom: 8 }}>{title}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function PostCard({ post, onClick }: { post: any; onClick: () => void }) {
  const meta = POST_TYPE_META[post.type] ?? POST_TYPE_META.NOTE;
  return (
    <Card
      onClick={onClick as any}
      style={{
        padding: 14, cursor: 'pointer',
        borderLeft: `3px solid ${meta.color}`,
      }}
      className="hover:shadow-sm"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <PostTypeChip type={post.type} />
        {post.urgency === 'CRITICAL' && <span className="pill" style={{ background: COLORS.danger, color: '#fff' }}>🚨 Critique</span>}
        {post.urgency === 'HIGH' && <span className="pill" style={{ background: COLORS.warning, color: '#fff' }}>Important</span>}
        {post.status === 'RESOLVED' && <span className="pill" style={{ background: COLORS.success + '1a', color: COLORS.success, border: `1px solid ${COLORS.success}33` }}>✓ Résolu</span>}
        <div className="flex-1" />
        <div style={{ fontSize: 11, color: COLORS.muted }}>{timeAgo(post.createdAt)}</div>
      </div>
      <div className="flex items-start gap-2.5">
        <Avatar firstName={post.author.firstName} lastName={post.author.lastName} size={28} />
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>
            {post.author.firstName} {post.author.lastName}
            {post.recipientUser && (
              <span style={{ color: COLORS.muted, fontWeight: 500 }}> → {post.recipientUser.firstName}</span>
            )}
            {post.scope === 'ALL' && (
              <span style={{ color: COLORS.muted, fontWeight: 500 }}> · à toute l'équipe</span>
            )}
          </div>
          <div style={{ fontSize: 13.5, marginTop: 4, whiteSpace: 'pre-wrap', overflow: 'hidden', maxHeight: 120 }}>{post.body}</div>
          {post.order && (
            <div className="inline-flex items-center gap-1.5 mt-2" style={{
              padding: '4px 8px', background: COLORS.primary + '0a', border: `1px solid ${COLORS.primary}33`,
              borderRadius: 6, fontSize: 11, color: COLORS.primary, fontWeight: 600,
              fontFamily: 'ui-monospace,Menlo,monospace',
            }}>
              📦 {post.order.ticketCode} — {post.order.customer?.fullName}
            </div>
          )}
          {post._count?.replies > 0 && (
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>💬 {post._count.replies} réponse(s)</div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function PourMoiPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<'toAct' | 'watching' | 'archive'>('toAct');
  const navigate = useNavigate();

  const load = () => api.get('/posts/inbox').then((r) => setData(r.data));
  useEffect(() => {
    load();
    const sock = getSocket();
    sock.on('post.created', load); sock.on('post.resolved', load); sock.on('post.replied', load);
    return () => { sock.off('post.created', load); sock.off('post.resolved', load); sock.off('post.replied', load); };
  }, []);

  if (!data) return <div className="p-6 text-muted">Chargement…</div>;

  const tabs = [
    { id: 'toAct', label: 'À traiter', count: data.toAct.length },
    { id: 'watching', label: 'À suivre', count: data.watching.length },
    { id: 'archive', label: 'Archive', count: data.archive.length },
  ];
  const items = data[tab];

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id} onClick={() => setTab(t.id as any)}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: tab === t.id ? COLORS.primary + '14' : '#fff',
              color: tab === t.id ? COLORS.primary : COLORS.text,
              border: `1px solid ${tab === t.id ? COLORS.primary : COLORS.border}`,
              cursor: 'pointer',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{ marginLeft: 6, padding: '1px 6px', background: tab === t.id ? COLORS.primary : COLORS.muted, color: '#fff', borderRadius: 999, fontSize: 10 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {items.length === 0 && (
        <Card style={{ padding: 32, textAlign: 'center', color: COLORS.muted }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 14 }}>Rien ici.</div>
        </Card>
      )}
      <div className="flex flex-col gap-2">
        {items.map((p: any) => <PostCard key={p.id} post={p} onClick={() => navigate(`/carnet/post/${p.id}`)} />)}
      </div>
    </div>
  );
}

export function ComposerPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<string>('HANDOFF');
  const [body, setBody] = useState('');
  const [scope, setScope] = useState<'DIRECT' | 'ALL' | 'SHOP'>('DIRECT');
  const [recipientUserId, setRecipientUserId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users').then((r) => setUsers(r.data.users));
    api.get('/orders?limit=50').then((r) => setOrders(r.data.orders));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/posts', {
      type, body, scope,
      recipientUserId: scope === 'DIRECT' ? recipientUserId : null,
      orderId: orderId || null, urgency,
    });
    navigate('/carnet');
  };

  if (step === 1) {
    return (
      <div className="p-6">
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Que veux-tu poster ?</div>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 18 }}>Choisis le type qui correspond à ton message.</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {Object.entries(POST_TYPE_META).map(([id, m]) => (
            <button
              key={id}
              onClick={() => { setType(id); setStep(2); }}
              style={{
                padding: 16, borderRadius: 10, border: `1px solid ${COLORS.border}`,
                background: COLORS.panel, cursor: 'pointer', textAlign: 'left',
                transition: 'all 100ms',
              }}
              className="hover:shadow-sm"
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.4 }}>{m.example}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const meta = POST_TYPE_META[type];
  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>
        ← Changer de type
      </button>
      <div className="flex items-center gap-2 mb-4"><PostTypeChip type={type} /></div>
      <Card style={{ padding: 18 }}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Visibilité</label>
            <div className="flex gap-2 mt-1.5">
              {[
                { v: 'DIRECT', l: 'À une personne' },
                { v: 'ALL', l: 'À toute l\'équipe' },
                { v: 'SHOP', l: 'À une boutique' },
              ].map((s) => (
                <button
                  key={s.v} type="button" onClick={() => setScope(s.v as any)}
                  style={{
                    padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: scope === s.v ? COLORS.primary : '#fff',
                    color: scope === s.v ? '#fff' : COLORS.text,
                    border: `1px solid ${scope === s.v ? COLORS.primary : COLORS.border}`,
                    cursor: 'pointer',
                  }}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          {scope === 'DIRECT' && (
            <div>
              <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Destinataire</label>
              <select value={recipientUserId} onChange={(e) => setRecipientUserId(e.target.value)} required
                style={{ marginTop: 4, width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }}
              >
                <option value="">— Sélectionner —</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} · {u.role}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Lié à une commande (facultatif)</label>
            <select value={orderId} onChange={(e) => setOrderId(e.target.value)}
              style={{ marginTop: 4, width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }}
            >
              <option value="">— Aucune —</option>
              {orders.map((o) => <option key={o.id} value={o.id}>{o.ticketCode} — {o.customer.fullName}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Urgence</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}
              style={{ marginTop: 4, width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }}
            >
              <option value="LOW">Basse</option>
              <option value="NORMAL">Normale</option>
              <option value="HIGH">Haute</option>
              <option value="CRITICAL">Critique (notif renforcée)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Message *</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={5}
              placeholder={meta.example}
              style={{ marginTop: 4, width: '100%', padding: 12, borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, resize: 'vertical' }}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Publier</Button>
            <Button variant="ghost" onClick={() => navigate('/carnet')}>Annuler</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const me = useAuth((s) => s.user);
  const [post, setPost] = useState<any>(null);
  const [reply, setReply] = useState('');
  const navigate = useNavigate();

  const [missing, setMissing] = useState(false);

  const load = () => api.get(`/posts/${id}`).then((r) => setPost(r.data.post)).catch(() => setMissing(true));
  useEffect(() => {
    load();
    // Réponse ou clôture de CE message par quelqu'un d'autre : mise à jour immédiate
    const sock = getSocket();
    const onEvt = (e: any) => { if (e.id === id) load(); };
    sock.on('post.replied', onEvt); sock.on('post.resolved', onEvt);
    return () => { sock.off('post.replied', onEvt); sock.off('post.resolved', onEvt); };
  }, [id]);

  if (missing) return <div className="p-6" style={{ color: COLORS.muted }}>Ce message est introuvable ou ne t'est pas destiné.</div>;
  if (!post) return <div className="p-6 text-muted">Chargement…</div>;

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    await api.post(`/posts/${id}/replies`, { body: reply });
    setReply(''); load();
  };

  const resolve = async () => {
    await api.post(`/posts/${id}/resolve`, {});
    load();
  };

  const react = async (emoji: string) => {
    await api.post(`/posts/${id}/react`, { emoji });
    load();
  };

  const meta = POST_TYPE_META[post.type] ?? POST_TYPE_META.NOTE;
  const canResolve = post.status !== 'RESOLVED' &&
    (post.authorId === me?.id || post.recipientUserId === me?.id || me?.role === 'ADMIN');

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>
        ← Retour
      </button>

      <Card style={{ padding: 24, borderLeft: `4px solid ${meta.color}` }}>
        <div className="flex items-center gap-2 mb-3">
          <PostTypeChip type={post.type} />
          {post.status === 'RESOLVED' && <span className="pill" style={{ background: COLORS.success + '1a', color: COLORS.success, border: `1px solid ${COLORS.success}33` }}>✓ Résolu</span>}
          <div className="flex-1" />
          <div style={{ fontSize: 12, color: COLORS.muted }}>{fmtDateTime(post.createdAt)}</div>
        </div>
        <div className="flex items-start gap-3 mb-3">
          <Avatar firstName={post.author.firstName} lastName={post.author.lastName} size={36} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{post.author.firstName} {post.author.lastName}</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>
              {post.scope === 'DIRECT' && post.recipientUser ? `→ ${post.recipientUser.firstName} ${post.recipientUser.lastName}` : 'à toute l\'équipe'}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{post.body}</div>
        {post.order && (
          <Link
            to={`/orders/${post.order.id}`}
            className="inline-flex items-center gap-2 mb-3" style={{
              padding: '8px 12px', background: COLORS.primary + '0a', border: `1px solid ${COLORS.primary}33`,
              borderRadius: 8, fontSize: 12, color: COLORS.primary, fontWeight: 600, textDecoration: 'none',
              fontFamily: 'ui-monospace,Menlo,monospace',
            }}
          >
            📦 {post.order.ticketCode} — {post.order.customer?.fullName}
          </Link>
        )}

        {/* Reactions */}
        <div className="flex gap-1.5 mt-3">
          {[
            { e: 'THUMBS_UP', i: '👍' },
            { e: 'CHECK', i: '✅' },
            { e: 'EYES', i: '👀' },
            { e: 'QUESTION', i: '❓' },
            { e: 'ALERT', i: '🚨' },
          ].map((r) => {
            const count = post.reactions?.filter((x: any) => x.emoji === r.e).length ?? 0;
            return (
              <button
                key={r.e} onClick={() => react(r.e)}
                style={{
                  padding: '4px 10px', borderRadius: 999, border: `1px solid ${COLORS.border}`,
                  background: '#fff', cursor: 'pointer', fontSize: 13,
                }}
              >
                {r.i} {count > 0 && <span style={{ fontSize: 11, fontWeight: 600 }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {canResolve && <Button onClick={resolve} variant="primary">Marquer résolu ✓</Button>}
        </div>

        {/* Receipts */}
        {post.receipts?.length > 0 && (
          <div style={{ marginTop: 18, fontSize: 12, color: COLORS.muted, padding: '10px 12px', background: COLORS.bg, borderRadius: 8 }}>
            Vu par : {post.receipts.map((r: any) => `${r.user.firstName} ${r.user.lastName ?? ''}`.trim()).join(', ')}
          </div>
        )}

        {/* Replies */}
        {post.replies?.length > 0 && (
          <div className="mt-5">
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.4, marginBottom: 8 }}>
              RÉPONSES ({post.replies.length})
            </div>
            {post.replies.map((r: any) => (
              <div key={r.id} className="flex gap-2.5" style={{ padding: '10px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                <Avatar firstName={r.author.firstName} lastName={r.author.lastName} size={26} />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.author.firstName}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{timeAgo(r.createdAt)}</div>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 2, whiteSpace: 'pre-wrap' }}>{r.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={submitReply} className="flex gap-2 mt-4">
          <input
            value={reply} onChange={(e) => setReply(e.target.value)}
            placeholder="Répondre…"
            style={{ flex: 1, height: 38, padding: '0 12px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14 }}
          />
          <Button type="submit">Envoyer</Button>
        </form>
      </Card>
    </div>
  );
}
